import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SubmissionController } from "./submission.controller";
import { SubmissionEntity } from "./submission.entity";
import { SubmissionService } from "./submission.service";

@Module({
    imports: [TypeOrmModule.forFeature([SubmissionEntity])],
    exports: [SubmissionService],
    providers: [SubmissionService],
    controllers: [SubmissionController],
})
export class SubmissionModule {}
