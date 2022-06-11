import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { escapeLike } from '@/database/database.utils';
import { ProblemContentDto, ProblemMetaDto, ProblemTagMetaDto } from '@/problem/dto';
import { ProblemTagEntity, ProblemTagType } from '@/problem/problem-tag.entity';
import { ProblemTagMapEntity } from '@/problem/problem-tag-map.entity';
import { UserEntity, UserType } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { ProblemEntity, ProblemPermission } from './problem.entity';

@Injectable()
export class ProblemService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(ProblemEntity)
    private readonly problemRepository: Repository<ProblemEntity>,
    @InjectRepository(ProblemTagEntity)
    private readonly problemTagRepository: Repository<ProblemTagEntity>,
    @InjectRepository(ProblemTagMapEntity)
    private readonly problemTagMapRepository: Repository<ProblemTagMapEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  public problemIsAllowedView(problem: ProblemEntity, user: UserEntity): boolean {
    if (!user || user.isBlocked) return false;
    if (user.isManager) return true;
    if (!problem.isPublic) return false;
    if (problem.permission === ProblemPermission.ALL) return true;
    if (problem.permission === ProblemPermission.PAYING) {
      return user.type !== UserType.GENERAL;
    } else if (problem.permission === ProblemPermission.SCHOOL) {
      return user.type === UserType.SCHOOL;
    }
    return false;
  }

  public userCanViewProblemPermissions(user: UserEntity): ProblemPermission[] {
    if (!user || user.isBlocked) return [];
    if (user.isManager || user.type === UserType.SCHOOL) {
      return [ProblemPermission.ALL, ProblemPermission.PAYING, ProblemPermission.SCHOOL];
    }
    if (user.type === UserType.PAYING) {
      return [ProblemPermission.ALL, ProblemPermission.PAYING];
    }
    return [ProblemPermission.ALL];
  }

  public async findProblemById(id: number): Promise<ProblemEntity> {
    return await this.problemRepository.findOne(id);
  }

  public async findProblemByDisplayId(displayId: number): Promise<ProblemEntity> {
    return await this.problemRepository.findOne({ displayId });
  }

  public async getProblemMeta(
    problem: ProblemEntity,
    queryTags: boolean,
    queryJudgeState: boolean,
    currentUser: UserEntity,
  ): Promise<ProblemMetaDto> {
    // TODO: query judge state

    const meta: ProblemMetaDto = {
      id: problem.displayId,
      title: problem.title,
      isPublic: problem.isPublic,
      submissionCount: problem.submissionCount,
      acceptedSubmissionCount: problem.acceptedSubmissionCount,
    };

    if (queryTags) {
      const queryBuilder = await this.problemTagRepository.createQueryBuilder('tag');
      const tagIdsQuery = queryBuilder
        .subQuery()
        .select('map.problemTagId')
        .from(ProblemTagMapEntity, 'map')
        .where('map.problemId = :problemId ', { problemId: problem.id })
        .getQuery();
      queryBuilder
        .where(`id IN ${tagIdsQuery}`)
        .orderBy('type', 'ASC')
        .addOrderBy('`order`', 'ASC');
      meta.tags = (await queryBuilder.getMany()).map(tag => this.getProblemTagMeta(tag));
    }

    return meta;
  }

  async getProblemContent(
    problem: ProblemEntity,
    currentUser: UserEntity,
  ): Promise<ProblemContentDto> {
    return {
      description: problem.description,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      limitAndHint: problem.limitAndHint,
      type: problem.type,
      owner: await this.userService.getUserMeta(await problem.owner, currentUser),
      samples: (await problem.samples).map(sample => ({
        input: sample.input,
        output: sample.output,
        explanation: sample.explanation,
      })),
    };
  }

  async findProblemsByExistingIds(problemIds: number[]): Promise<ProblemEntity[]> {
    if (problemIds.length === 0) return [];
    const uniqueIds = Array.from(new Set(problemIds));
    const records = await this.problemRepository.findByIds(uniqueIds);
    const map = Object.fromEntries(records.map(record => [record.id, record]));
    return problemIds.map(problemId => map[problemId]);
  }

  public async getProblemList(
    sortBy: 'id' | 'title' | 'submissionCount' | 'acceptedSubmissionCount',
    order: 'ASC' | 'DESC',
    skipCount: number,
    takeCount: number,
    keyword: string,
    tagIds: number[],
    currentUser: UserEntity,
  ): Promise<[problems: ProblemEntity[], count: number]> {
    const queryBuilder = this.problemRepository
      .createQueryBuilder('problem')
      .select('problem.id', 'id')
      .where('permission IN (:permissions)', {
        permissions: this.userCanViewProblemPermissions(currentUser),
      });

    if (!currentUser.isManager) {
      queryBuilder.andWhere('isPublic = 1');
    }

    if (tagIds && tagIds.length > 0) {
      queryBuilder
        .innerJoin(ProblemTagMapEntity, 'map', 'problem.id = map.problemId')
        .andWhere('map.problemTagId IN (:...tagIds)', { tagIds })
        .groupBy('problem.id');
      if (tagIds.length > 1)
        queryBuilder.having('COUNT(DISTINCT map.problemTagId) = :count', { count: tagIds.length });
    }

    if (keyword) {
      queryBuilder.andWhere('problem.title LIKE :like', { like: `%${escapeLike(keyword)}%` });
    }

    // QueryBuilder.getManyAndCount() has a bug with GROUP BY
    const count = Number(
      (
        await this.connection
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from(`(${queryBuilder.getQuery()})`, 'temp')
          .setParameters(queryBuilder.expressionMap.parameters)
          .getRawOne()
      ).count,
    );

    queryBuilder.orderBy(sortBy === 'id' ? 'problem.displayId' : `problem.${sortBy}`, order);
    const result = await queryBuilder
      .limit(takeCount)
      .offset(skipCount * takeCount)
      .getRawMany();
    return [await this.findProblemsByExistingIds(result.map(row => row.id)), count];
  }

  public getProblemTagMeta(tag: ProblemTagEntity): ProblemTagMetaDto {
    return {
      id: tag.id,
      name: tag.name,
      type: tag.type,
      order: tag.order,
    };
  }

  public async getProblemTagList(type?: ProblemTagType): Promise<ProblemTagEntity[]> {
    const queryBuilder = this.problemTagRepository
      .createQueryBuilder()
      .orderBy('`order`', 'ASC')
      .addOrderBy('name', 'ASC');
    if (type) queryBuilder.where('type = :type', { type });
    return await queryBuilder.getMany();
  }
}
