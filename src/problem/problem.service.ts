import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";

import { CE_Permission, checkIsAllowed } from "@/common/user-level";
import { escapeLike } from "@/database/database.utils";
import { ProblemTagService } from "@/problem/problem-tag.service";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";

import { ProblemEntity } from "./problem.entity";
import {
    E_ProblemScope,
    IProblemAtomicEntityWithExtra,
    IProblemBaseEntityWithExtra,
    IProblemEntityWithExtra,
} from "./problem.types";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";
import { IProblemJudgeInfoEntity } from "./problem-judge-info.types";
import { ProblemSampleEntity } from "./problem-sample.entity";
import { IProblemSampleEntity } from "./problem-sample.types";
import { ProblemTagMapEntity } from "./problem-tag-map.entity";

@Injectable()
export class ProblemService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(ProblemEntity)
        private readonly problemRepository: Repository<ProblemEntity>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly problemTagService: ProblemTagService,
    ) {}

    public async findProblemByIdAsync(id: number): Promise<ProblemEntity> {
        return await this.problemRepository.findOne({ where: { id } });
    }

    public async findProblemByDisplayIdAsync(displayId: number): Promise<ProblemEntity> {
        return await this.problemRepository.findOne({ where: { displayId } });
    }

    public async findProblemsByExistingIdsAsync(problemIds: number[]): Promise<ProblemEntity[]> {
        if (problemIds.length === 0) return [];
        const uniqueIds = Array.from(new Set(problemIds));
        const records = await this.problemRepository.findBy({ id: In(uniqueIds) });
        const map = Object.fromEntries(records.map((record) => [record.id, record]));
        return problemIds.map((problemId) => map[problemId]);
    }

    public async findProblemListAsync(
        sortBy: "id" | "title" | "submissionCount" | "acceptedSubmissionCount",
        order: "ASC" | "DESC",
        skipCount: number,
        takeCount: number,
        keyword: string,
        tagIds: number[],
        currentUser: UserEntity,
    ): Promise<[problems: ProblemEntity[], count: number]> {
        const queryBuilder = this.problemRepository
            .createQueryBuilder("problem")
            .select("problem.id", "id")
            .where("level <= :level", { level: currentUser.level })
            .andWhere("scope = :scope", { scope: E_ProblemScope.Global })
            .andWhere("problem.displayId IS NOT NULL");

        if (!checkIsAllowed(currentUser.level, CE_Permission.ManageProblem)) {
            queryBuilder.andWhere((qb) => {
                qb.where("isPublic = 1");
            });
        }

        if (tagIds && tagIds.length > 0) {
            queryBuilder
                .innerJoin(ProblemTagMapEntity, "map", "problem.id = map.problemId")
                .andWhere("map.problemTagId IN (:...tagIds)", { tagIds })
                .groupBy("problem.id");
            if (tagIds.length > 1) {
                queryBuilder.having("COUNT(DISTINCT map.problemTagId) = :count", { count: tagIds.length });
            }
        }

        if (keyword) {
            queryBuilder.andWhere("problem.title LIKE :like", { like: `%${escapeLike(keyword)}%` });
        }

        // QueryBuilder.getManyAndCount() has a bug with GROUP BY
        const count = Number(
            (
                await this.dataSource
                    .createQueryBuilder()
                    .select("COUNT(*)", "count")
                    .from(`(${queryBuilder.getQuery()})`, "temp")
                    .setParameters(queryBuilder.expressionMap.parameters)
                    .getRawOne()
            ).count,
        );

        queryBuilder.orderBy(sortBy === "id" ? "problem.displayId" : `problem.${sortBy}`, order);
        const result = await queryBuilder
            .limit(takeCount)
            .offset(skipCount * takeCount)
            .getRawMany();
        return [await this.findProblemsByExistingIdsAsync(result.map((row) => row.id)), count];
    }

    public getProblemAtomicDetail(problem: ProblemEntity): IProblemAtomicEntityWithExtra {
        return {
            id: problem.id,
            displayId: problem.displayId,
            title: problem.title,
        };
    }

    public async getProblemBaseDetailAsync(
        problem: ProblemEntity,
        queryTags: boolean,
    ): Promise<IProblemBaseEntityWithExtra> {
        const baseDetail: IProblemBaseEntityWithExtra = {
            ...this.getProblemAtomicDetail(problem),
            subtitle: problem.subtitle,
            isPublic: problem.isPublic,
            publicTime: problem.publicTime,
            scope: problem.scope,
            submissionCount: problem.submissionCount,
            acceptedSubmissionCount: problem.acceptedSubmissionCount,
        };

        if (queryTags) {
            const tags = await this.problemTagService.findProblemTagListByProblemIdAsync(problem.id);
            baseDetail.tags = await Promise.all(
                tags.map((tag) => this.problemTagService.getProblemTagDetailAsync(tag)),
            );
        }

        return baseDetail;
    }

    public async getProblemDetailAsync(problem: ProblemEntity, queryTags: boolean): Promise<IProblemEntityWithExtra> {
        const judgeInfo = await problem.judgeInfo;

        return {
            ...(await this.getProblemBaseDetailAsync(problem, queryTags)),
            description: problem.description,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            limitAndHint: problem.limitAndHint,
            type: problem.type,
            level: problem.level,
            owner: await this.userService.getUserAtomicDetail(await problem.owner),
            samples: (await problem.samples).map((sample) => this.getProblemSampleDetail(sample)),
            judgeInfo: judgeInfo ? this.getProblemJudgeInfoDetail(judgeInfo) : null,
        };
    }

    public getProblemSampleDetail(problemSample: ProblemSampleEntity): IProblemSampleEntity {
        return {
            id: problemSample.id,
            input: problemSample.input,
            output: problemSample.output,
            explanation: problemSample.explanation,
        };
    }

    public getProblemJudgeInfoDetail(problemJudgeInfo: ProblemJudgeInfoEntity): IProblemJudgeInfoEntity {
        return {
            problemId: problemJudgeInfo.problemId,
            timeLimit: problemJudgeInfo.timeLimit,
            memoryLimit: problemJudgeInfo.memoryLimit,
            fileIO: problemJudgeInfo.fileIO,
            inputFile: problemJudgeInfo.inputFile,
            outputFile: problemJudgeInfo.outputFile,
        };
    }

    public checkIsAllowedAccess(currentUser: UserEntity): boolean {
        return checkIsAllowed(currentUser.level, CE_Permission.AccessProblem);
    }

    public checkIsAllowedView(problem: ProblemEntity, currentUser: UserEntity): boolean {
        if (!this.checkIsAllowedAccess(currentUser)) return false;
        if (this.checkIsAllowedManage(problem, currentUser)) return true;

        if (problem.scope === E_ProblemScope.Group) {
            // should check this at group service
            return checkIsAllowed(currentUser.level, CE_Permission.AccessGroup);
        } else if (problem.scope === E_ProblemScope.Personal) {
            return currentUser.id === problem.ownerId;
        } /* E_ProblemScope.Global */ else {
            return currentUser.level >= problem.level && problem.isPublic;
        }
    }

    public checkIsAllowedManage(problem: ProblemEntity, currentUser: UserEntity): boolean {
        if (!this.checkIsAllowedAccess(currentUser)) return false;
        if (checkIsAllowed(currentUser.level, CE_Permission.ManageProblem)) return true;

        if (problem.scope === E_ProblemScope.Group) {
            // should check this at group service
            return checkIsAllowed(currentUser.level, CE_Permission.AccessGroup);
        } else if (problem.scope === E_ProblemScope.Personal) {
            return problem.ownerId === currentUser.id;
        } /* E_ProblemScope.Global */ else {
            return false;
        }
    }

    public checkIsAllowedCreate(problemScope: E_ProblemScope, currentUser: UserEntity): boolean {
        if (!this.checkIsAllowedAccess(currentUser)) return false;

        if (problemScope === E_ProblemScope.Group) {
            // should check this at group service
            return checkIsAllowed(currentUser.level, CE_Permission.AccessGroup);
        } else if (problemScope === E_ProblemScope.Personal) {
            return checkIsAllowed(currentUser.level, CE_Permission.CreatePersonalProblem);
        } /* E_ProblemScope.Global */ else {
            return checkIsAllowed(currentUser.level, CE_Permission.ManageProblem);
        }
    }
}
