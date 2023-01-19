import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";

import { CE_Permissions, checkIsAllowed } from "@/common/user-level";
import { escapeLike } from "@/database/database.utils";
import { ProblemSampleEntity } from "@/problem/problem-sample.entity";
import { IProblemSampleEntity } from "@/problem/problem-sample.types";
import { IProblemTagEntity, IProblemTagTypeEntity } from "@/problem/problem-tag.types";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";

import { ProblemEntity } from "./problem.entity";
import { E_ProblemScope, IProblemBaseEntityWithExtra, IProblemEntityWithExtra } from "./problem.types";
import { ProblemTagEntity } from "./problem-tag.entity";
import { ProblemTagMapEntity } from "./problem-tag-map.entity";
import { ProblemTagTypeEntity } from "./problem-tag-type.entity";

@Injectable()
export class ProblemService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ProblemEntity)
    private readonly problemRepository: Repository<ProblemEntity>,
    @InjectRepository(ProblemTagEntity)
    private readonly problemTagRepository: Repository<ProblemTagEntity>,
    @InjectRepository(ProblemTagMapEntity)
    private readonly problemTagMapRepository: Repository<ProblemTagMapEntity>,
    @InjectRepository(ProblemTagTypeEntity)
    private readonly problemTagTypeRepository: Repository<ProblemTagTypeEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
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
    const map = Object.fromEntries(records.map(record => [record.id, record]));
    return problemIds.map(problemId => map[problemId]);
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
      .andWhere("scope = :scope", { scope: E_ProblemScope.Global });

    if (!checkIsAllowed(currentUser.level, CE_Permissions.ManageProblem)) {
      queryBuilder.andWhere(qb => {
        qb.where("isPublic = 1").orWhere("ownerId = :ownerId", { ownerId: currentUser.id });
      });
    }

    if (tagIds && tagIds.length > 0) {
      queryBuilder
        .innerJoin(ProblemTagMapEntity, "map", "problem.id = map.problemId")
        .andWhere("map.problemTagId IN (:...tagIds)", { tagIds })
        .groupBy("problem.id");
      if (tagIds.length > 1) queryBuilder.having("COUNT(DISTINCT map.problemTagId) = :count", { count: tagIds.length });
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
    return [await this.findProblemsByExistingIdsAsync(result.map(row => row.id)), count];
  }

  public async findProblemTagsByProblemIdAsync(problemId: number): Promise<ProblemTagEntity[]> {
    const queryBuilder = this.problemTagRepository.createQueryBuilder("tag");
    const tagIdsQuery = queryBuilder
      .subQuery()
      .select("tagMap.problemTagId")
      .from(ProblemTagMapEntity, "tagMap")
      .where("tagMap.problemId = :problemId ", { problemId })
      .getQuery();
    queryBuilder.where(`id IN ${tagIdsQuery}`).orderBy("`order`", "ASC");
    return await queryBuilder.getMany();
  }

  public async getProblemBaseDetailAsync(
    problem: ProblemEntity,
    queryTags: boolean,
  ): Promise<IProblemBaseEntityWithExtra> {
    const baseDetail: IProblemBaseEntityWithExtra = {
      id: problem.id,
      displayId: problem.displayId,
      title: problem.title,
      subtitle: problem.subtitle,
      isPublic: problem.isPublic,
      scope: problem.scope,
      submissionCount: problem.submissionCount,
      acceptedSubmissionCount: problem.acceptedSubmissionCount,
    };

    if (queryTags) {
      const tags = await this.findProblemTagsByProblemIdAsync(problem.id);
      baseDetail.tags = tags.map(tag => this.getProblemTagDetail(tag));
    }

    return baseDetail;
  }

  public async getProblemDetailAsync(
    problem: ProblemEntity,
    queryTags: boolean,
    currentUser: UserEntity,
  ): Promise<IProblemEntityWithExtra> {
    return {
      ...(await this.getProblemBaseDetailAsync(problem, queryTags)),
      description: problem.description,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      limitAndHint: problem.limitAndHint,
      type: problem.type,
      level: problem.level,
      owner: await this.userService.getUserBaseDetail(await problem.owner, currentUser),
      samples: (await problem.samples).map(sample => this.getProblemSampleDetail(sample)),
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

  public getProblemTagDetail(tag: ProblemTagEntity): IProblemTagEntity {
    return {
      id: tag.id,
      name: tag.name,
      typeId: tag.typeId,
      order: tag.order,
    };
  }

  public getProblemTagTypeDetail(tagType: ProblemTagTypeEntity): IProblemTagTypeEntity {
    return {
      id: tagType.id,
      name: tagType.name,
      color: tagType.color,
      order: tagType.order,
    };
  }

  public checkIsAllowedView(problem: ProblemEntity, currentUser: UserEntity): boolean {
    if (this.checkIsAllowedManage(problem, currentUser)) return true;

    if (problem.scope === E_ProblemScope.Global) {
      return currentUser.level >= problem.level || currentUser.id === problem.ownerId;
    } else if (problem.scope === E_ProblemScope.Group) {
      // TODO: check current user is in group or problem owner
      return currentUser.id === problem.ownerId;
    } else if (problem.scope === E_ProblemScope.Personal) {
      return currentUser.id === problem.ownerId;
    } else {
      return false;
    }
  }

  public checkIsAllowedManage(problem: ProblemEntity, currentUser: UserEntity): boolean {
    if (checkIsAllowed(currentUser.level, CE_Permissions.ManageProblem)) return true;

    if (problem.scope === E_ProblemScope.Group) {
      // TODO: check current user is group manager or problem owner
      return problem.ownerId === currentUser.id;
    } else if (problem.scope === E_ProblemScope.Personal) {
      return problem.ownerId === currentUser.id;
    } else {
      return false;
    }
  }
}
