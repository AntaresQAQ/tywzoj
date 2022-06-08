import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { ProblemMetaDto, ProblemTagMetaDto } from '@/problem/dto';
import { ProblemTagEntity, ProblemTagType } from '@/problem/problem-tag.entity';
import { ProblemTagMapEntity } from '@/problem/problem-tag-map.entity';
import { UserEntity, UserType } from '@/user/user.entity';

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

  public async getProblemList(
    sortBy: 'id' | 'title' | 'submissionCount' | 'acceptedSubmissionCount',
    order: 'ASC' | 'DESC',
    skipCount: number,
    takeCount: number,
    tagIds: number[],
    currentUser: UserEntity,
  ): Promise<[problems: ProblemEntity[], count: number]> {
    const queryBuilder = this.problemRepository
      .createQueryBuilder('problem')
      .orderBy(sortBy === 'id' ? 'problem.displayId' : `problem.${sortBy}`, order)
      .skip(skipCount)
      .take(takeCount)
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

    return await queryBuilder.getManyAndCount();
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
