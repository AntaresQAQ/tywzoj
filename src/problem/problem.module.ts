import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileModule } from "@/file/file.module";
import { RedisModule } from "@/redis/redis.module";
import { UserModule } from "@/user/user.module";

import { ProblemController } from "./problem.controller";
import { ProblemEntity } from "./problem.entity";
import { ProblemService } from "./problem.service";
import { ProblemFileEntity } from "./problem-file.entity";
import { ProblemFileService } from "./problem-file.service";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";
import { ProblemSampleEntity } from "./problem-sample.entity";
import { ProblemSetEntity } from "./problem-set.entity";
import { ProblemSetMapEntity } from "./problem-set-map.entity";
import { ProblemTagEntity } from "./problem-tag.entity";
import { ProblemTagService } from "./problem-tag.service";
import { ProblemTagMapEntity } from "./problem-tag-map.entity";
import { ProblemTagTypeEntity } from "./problem-tag-type.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProblemEntity]),
    TypeOrmModule.forFeature([ProblemFileEntity]),
    TypeOrmModule.forFeature([ProblemSampleEntity]),
    TypeOrmModule.forFeature([ProblemJudgeInfoEntity]),
    TypeOrmModule.forFeature([ProblemTagEntity]),
    TypeOrmModule.forFeature([ProblemTagMapEntity]),
    TypeOrmModule.forFeature([ProblemTagTypeEntity]),
    TypeOrmModule.forFeature([ProblemSetEntity]),
    TypeOrmModule.forFeature([ProblemSetMapEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => FileModule),
    forwardRef(() => RedisModule),
  ],
  providers: [ProblemService, ProblemTagService, ProblemFileService],
  exports: [ProblemService, ProblemTagService, ProblemFileService],
  controllers: [ProblemController],
})
export class ProblemModule {}
