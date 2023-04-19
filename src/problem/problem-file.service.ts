import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import jwt from "jsonwebtoken";
import { DataSource } from "typeorm";

import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { IFileUploadRequest } from "@/file/file.types";

import { ProblemEntity } from "./problem.entity";
import { InvalidFileUploadTokenException } from "./problem.exception";
import { ProblemFileEntity } from "./problem-file.entity";
import {
  E_ProblemFileType,
  IProblemFileEntityWithExtra,
  IProblemFileTokenPayload,
  IProblemFileTokenRaw,
} from "./problem-file.type";

@Injectable()
export class ProblemFileService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  public async getProblemFileDetailAsync(problemFile: ProblemFileEntity): Promise<IProblemFileEntityWithExtra> {
    const file = await this.fileService.findFileByUUIDAsync(problemFile.uuid);

    return {
      id: problemFile.id,
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
      const payload = jwt.verify(token, this.configService.config.security.sessionSecret) as IProblemFileTokenPayload;
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

  public async signProblemFileUploadRequestAsync(size: number): Promise<IFileUploadRequest> {
    return await this.fileService.signUserUploadRequestAsync(size, size);
  }

  public async reportProblemFileUploadedAsync(
    problem: ProblemEntity,
    uuid: string,
    filename: string,
    type: E_ProblemFileType,
  ): Promise<IProblemFileEntityWithExtra> {
    let problemFile: ProblemFileEntity;
    let deleteMinioFileFunction: () => void;

    await this.dataSource.transaction("READ COMMITTED", async entityManager => {
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

    deleteMinioFileFunction && deleteMinioFileFunction();

    return await this.getProblemFileDetailAsync(problemFile);
  }
}
