import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import { DataSource, Not, Repository } from "typeorm";

import { format, md5 } from "@/common/utils";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { IFileUploadRequest } from "@/file/file.types";
import { RedisService } from "@/redis/redis.service";

import { ProblemEntity } from "./problem.entity";
import {
    FileLimitExceededException,
    InvalidFileUploadTokenException,
    TooLargeUploadFileException,
    TooManyFileUploadRequestException,
} from "./problem.exception";
import { ProblemFileEntity } from "./problem-file.entity";
import {
    E_ProblemFileType,
    IProblemFileEntityWithExtra,
    IProblemFileTokenPayload,
    IProblemFileTokenRaw,
} from "./problem-file.type";

const PROBLEM_FILE_UPLOAD_REQUEST_REDIS_KEY = "problem-file-request:%d:%s:%s"; // problemId:type:filenameHash
const PROBLEM_FILE_UPLOAD_REQUEST_REDIS_PATTERN = "problem-file-request:%d:%s:*"; // problemId:type
const PROBLEM_FILE_UPLOAD_REQUEST_EXPIRE_TIME = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class ProblemFileService {
    private readonly redisClient: Redis;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(ProblemFileEntity)
        private readonly problemFileRepository: Repository<ProblemFileEntity>,
        @Inject(forwardRef(() => FileService))
        private readonly fileService: FileService,
        @Inject(forwardRef(() => RedisService))
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {
        this.redisClient = redisService.getClient();
    }

    public async findProblemFilesByProblemIdAsync(problemId: number, type?: E_ProblemFileType) {
        return await this.problemFileRepository.find({ where: { problemId, type }, order: { filename: "ASC" } });
    }

    public async getProblemFileDetailAsync(problemFile: ProblemFileEntity): Promise<IProblemFileEntityWithExtra> {
        const file = await this.fileService.findFileByUUIDAsync(problemFile.uuid);

        return {
            filename: problemFile.filename,
            type: problemFile.type,
            uuid: problemFile.uuid,
            file: file && this.fileService.getFileDetail(file),
        };
    }

    public encodeProblemFileUploadToken(raw: IProblemFileTokenRaw): string {
        const payload: IProblemFileTokenPayload = {
            p: raw.problemId,
            t: raw.type,
            s: raw.size,
            f: raw.filename,
        };
        return jwt.sign(payload, this.configService.config.security.sessionSecret);
    }

    public decodeProblemFileUploadToken(token: string): IProblemFileTokenRaw {
        try {
            const payload = jwt.verify(
                token,
                this.configService.config.security.sessionSecret,
            ) as IProblemFileTokenPayload;
            return {
                problemId: payload.p,
                type: payload.t,
                size: payload.s,
                filename: payload.f,
            };
        } catch {
            throw new InvalidFileUploadTokenException();
        }
    }

    public async signProblemFileUploadRequestAsync(
        problemId: number,
        problemFileType: E_ProblemFileType,
        filename: string,
        size: number,
    ): Promise<IFileUploadRequest> {
        let request: IFileUploadRequest = await this.getCachedUploadRequestAsync(problemId, problemFileType, filename);
        if (request) return request;

        const { problemTestdataFiles, problemTestdataSize, problemAdditionalFileFiles, problemAdditionalFileSize } =
            this.configService.config.resourceLimit;
        const existFileCount = await this.problemFileRepository.countBy({
            filename: Not(filename),
            problemId,
            type: problemFileType,
        });
        const requestCount = await this.countCachedUploadRequestAsync(problemId, problemFileType);

        if (problemFileType === E_ProblemFileType.TestData) {
            if (existFileCount >= problemTestdataFiles) throw new FileLimitExceededException();
            if (size >= problemTestdataSize) throw new TooLargeUploadFileException();
            if ((problemTestdataFiles - existFileCount) * 3 < requestCount) {
                throw new TooManyFileUploadRequestException();
            }
        } else if (problemFileType === E_ProblemFileType.AdditionalFile) {
            if (existFileCount >= problemAdditionalFileFiles) throw new FileLimitExceededException();
            if (size >= problemAdditionalFileSize) throw new TooLargeUploadFileException();
            if ((problemAdditionalFileFiles - existFileCount) * 3 < requestCount) {
                throw new TooManyFileUploadRequestException();
            }
        }

        request = await this.fileService.signUserUploadRequestAsync(size, size);
        await this.cacheUploadRequestAsync(problemId, problemFileType, filename, request);
        return request;
    }

    public async reportProblemFileUploadedAsync(
        problem: ProblemEntity,
        uuid: string,
        filename: string,
        type: E_ProblemFileType,
    ): Promise<IProblemFileEntityWithExtra> {
        let problemFile: ProblemFileEntity;
        let deleteMinioFileFunction: () => void;

        await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            problemFile = await entityManager.findOneBy(ProblemFileEntity, {
                filename,
                type,
                problemId: problem.id,
            });

            if (problemFile) {
                deleteMinioFileFunction = await this.fileService.deleteFileAsync(problemFile.uuid, entityManager);
            } else {
                problemFile = new ProblemFileEntity();
                problemFile.filename = filename;
                problemFile.type = type;
                problemFile.problemId = problem.id;
            }

            problemFile.uuid = uuid;

            await this.fileService.reportUserUploadRequestCompletedAsync(uuid, entityManager);
            await entityManager.save(ProblemFileEntity, problemFile);
        });

        await this.removeCachedUploadRequestAsync(problem.id, type, uuid);
        deleteMinioFileFunction && deleteMinioFileFunction();

        return await this.getProblemFileDetailAsync(problemFile);
    }

    private async cacheUploadRequestAsync(
        problemId: number,
        type: E_ProblemFileType,
        filename: string,
        fileUploadRequest: IFileUploadRequest,
    ) {
        const filenameHash = md5(filename);
        const redisKey = format(PROBLEM_FILE_UPLOAD_REQUEST_REDIS_KEY, problemId, type, filenameHash);
        await this.redisClient.set(
            redisKey,
            JSON.stringify(fileUploadRequest),
            "PX",
            PROBLEM_FILE_UPLOAD_REQUEST_EXPIRE_TIME,
        );
    }

    private async getCachedUploadRequestAsync(
        problemId: number,
        type: E_ProblemFileType,
        filename: string,
    ): Promise<IFileUploadRequest> {
        const filenameHash = md5(filename);
        const redisKey = format(PROBLEM_FILE_UPLOAD_REQUEST_REDIS_KEY, problemId, type, filenameHash);
        const value = await this.redisClient.get(redisKey);
        return value ? (JSON.parse(value) as IFileUploadRequest) : null;
    }

    private async removeCachedUploadRequestAsync(problemId: number, type: E_ProblemFileType, filename: string) {
        const filenameHash = md5(filename);
        const redisKey = format(PROBLEM_FILE_UPLOAD_REQUEST_REDIS_KEY, problemId, type, filenameHash);
        await this.redisClient.del(redisKey);
    }

    private async countCachedUploadRequestAsync(problemId: number, type: E_ProblemFileType) {
        const redisPattern = format(PROBLEM_FILE_UPLOAD_REQUEST_REDIS_PATTERN, problemId, type);
        const redisKeys = await this.redisClient.keys(redisPattern);
        return redisKeys.length;
    }
}
