import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserModule } from "@/user/user.module";

import { ProblemController } from "./problem.controller";
import { ProblemEntity } from "./problem.entity";
import { ProblemService } from "./problem.service";
import { ProblemSampleEntity } from "./problem-sample.entity";
import { ProblemSetEntity } from "./problem-set.entity";
import { ProblemSetMapEntity } from "./problem-set-map.entity";
import { ProblemTagEntity } from "./problem-tag.entity";
import { ProblemTagMapEntity } from "./problem-tag-map.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProblemEntity]),
    TypeOrmModule.forFeature([ProblemSampleEntity]),
    TypeOrmModule.forFeature([ProblemTagEntity]),
    TypeOrmModule.forFeature([ProblemTagMapEntity]),
    TypeOrmModule.forFeature([ProblemSetEntity]),
    TypeOrmModule.forFeature([ProblemSetMapEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [ProblemService],
  exports: [ProblemService],
  controllers: [ProblemController],
})
export class ProblemModule {}
