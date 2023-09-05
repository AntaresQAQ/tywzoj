import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { Client as MinioClient } from "minio";
import { Readable } from "stream";
import { DataSource, EntityManager, In, Repository } from "typeorm";

import { encodeRFC5987ValueChars, isEmptyValues, sleepAsync } from "@/common/utils";
import { ConfigService } from "@/config/config.service";
import { FileEntity } from "@/file/file.entity";
import { DuplicateUUIDException, FileNotUploadedException } from "@/file/file.exception";
import { IFileEntity, IFileUploadRequest } from "@/file/file.types";
import { logger } from "@/loggger";

const FILE_UPLOAD_EXPIRE_TIME = 10 * 60 * 1000; // 10 minutes (ms)
const FILE_DOWNLOAD_EXPIRE_TIME = 2 * 60 * 60; // 2 hours (s)

@Injectable()
export class FileService implements OnModuleInit {
    private readonly minioClient: MinioClient;
    private readonly bucket: string;
    private readonly userEndPointReplacer: (originalUrl: string) => string;
    private readonly judgeEndPointReplacer: (originalUrl: string) => string;

    public constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
        private readonly configService: ConfigService,
    ) {
        const config = configService.config.service.minio;

        this.bucket = config.bucket;
        this.minioClient = new MinioClient({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: config.accessKey,
            secretKey: config.secretKey,
            region: "us-east-1",
        });

        this.userEndPointReplacer = FileService.makeCustomEndPointReplacer(config.userEndPointUrl);
        this.judgeEndPointReplacer = FileService.makeCustomEndPointReplacer(config.judgeEndPointUrl);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async onModuleInit(): Promise<void> {
        let bucketExists: boolean;
        try {
            bucketExists = await this.minioClient.bucketExists(this.bucket);
        } catch (e) {
            throw new Error(
                `Error initializing the MinIO client. Please check your configuration file and MinIO server. \n${e}`,
            );
        }

        if (!bucketExists) {
            throw new Error(
                `MinIO bucket ${this.bucket} doesn't exist. Please check your configuration file and MinIO server.`,
            );
        }
    }

    private static makeCustomEndPointReplacer(endPointUrl?: string): (originalUrl: string) => string {
        if (!endPointUrl) return (originalUrl) => originalUrl;

        const url = new URL(endPointUrl);
        if (url.hash || url.search) {
            throw new Error("Search parameters and hash are not supported for MinIO custom endpoint URL.");
        }
        if (!url.pathname.endsWith("/")) throw new Error("MinIO custom endpoint URL's pathname must ends with '/'.");

        return (originalUrl) => {
            const parsedOriginUrl = new URL(originalUrl);
            return new URL(
                parsedOriginUrl.pathname.slice(1) + parsedOriginUrl.search + parsedOriginUrl.hash,
                url,
            ).toString();
        };
    }

    public async findFileByUUIDAsync(uuid: string) {
        return await this.fileRepository.findOneBy({ uuid });
    }

    public getFileDetail(file: FileEntity): IFileEntity {
        return {
            uuid: file.uuid,
            size: file.size,
            uploadTime: file.uploadTime,
        };
    }

    public async fileExistsAsync(uuid: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucket, uuid);
            return true;
        } catch (e) {
            if (e.message === "The specified key does not exist.") {
                return false;
            }
            throw e;
        }
    }

    public async uploadFileAsync(uuid: string, data: string | Buffer | Readable, retryCount = 10) {
        for (let i = 1; i <= retryCount; i++) {
            try {
                if (typeof data === "string") {
                    await this.minioClient.fPutObject(this.bucket, uuid, data);
                } else {
                    await this.minioClient.putObject(this.bucket, uuid, data);
                }
                break;
            } catch (e) {
                if (i === retryCount) {
                    throw e;
                } else {
                    await sleepAsync(1000);
                }
            }
        }
    }

    /**
     * @return A function to run after transaction, to delete the file(s) actually.
     */
    async deleteFileAsync(uuid: string | string[], entityManager: EntityManager): Promise<() => void> {
        if (typeof uuid === "string") {
            await entityManager.delete(FileEntity, { uuid });
            return () =>
                this.minioClient.removeObject(this.bucket, uuid).catch((e) => {
                    logger.error(`Failed to delete file ${uuid}: ${e}`);
                });
        }
        if (uuid.length > 0) {
            await entityManager.delete(FileEntity, { uuid: In(uuid) });
            return () =>
                this.minioClient.removeObjects(this.bucket, uuid).catch((e) => {
                    logger.error(`Failed to delete file [${uuid}]: ${e}`);
                });
        }
        return () => {
            /* do nothing */
        };
    }

    public async signUserUploadRequestAsync(minSize?: number, maxSize?: number): Promise<IFileUploadRequest> {
        const uuid = randomUUID();
        const policy = this.minioClient.newPostPolicy();
        policy.setBucket(this.bucket);
        policy.setKey(uuid);
        policy.setExpires(new Date(Date.now() + FILE_UPLOAD_EXPIRE_TIME));
        if (!isEmptyValues(minSize, maxSize)) {
            policy.setContentLengthRange(minSize || 0, maxSize || 0);
        }
        const result = await this.minioClient.presignedPostPolicy(policy);

        return {
            uuid,
            postUrl: this.userEndPointReplacer(result.postURL),
            formData: result.formData,
        };
    }

    public async reportUserUploadRequestCompletedAsync(
        uuid: string,
        entityManager: EntityManager,
    ): Promise<FileEntity> {
        if ((await entityManager.countBy(FileEntity, { uuid })) !== 0) {
            throw new DuplicateUUIDException();
        }
        if (!(await this.fileExistsAsync(uuid))) {
            throw new FileNotUploadedException();
        }

        const fileState = await this.minioClient.statObject(this.bucket, uuid);

        const file = new FileEntity();
        file.uuid = uuid;
        file.size = fileState.size;
        file.uploadTime = fileState.lastModified;

        await entityManager.save(FileEntity, file);

        return file;
    }

    public async signDownloadLinkAsync(uuid: string, filename: string): Promise<string> {
        return await this.minioClient.presignedGetObject(this.bucket, uuid, FILE_DOWNLOAD_EXPIRE_TIME, {
            "response-content-disposition": `attachment; filename="${encodeRFC5987ValueChars(filename)}"`,
        });
    }

    public async signUserDownloadLinkAsync(uuid: string, filename: string): Promise<string> {
        return this.userEndPointReplacer(await this.signDownloadLinkAsync(uuid, filename));
    }

    public async signJudgeDownloadLinkAsync(uuid: string, filename: string): Promise<string> {
        return this.judgeEndPointReplacer(await this.signDownloadLinkAsync(uuid, filename));
    }
}
