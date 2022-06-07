import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { ProblemMetaDto } from '@/problem/dto';
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
    currentUser: UserEntity,
  ): Promise<ProblemMetaDto> {
    // TODO: query tags
    // TODO: query judge state
    return {
      id: problem.displayId,
      title: problem.title,
      isPublic: problem.isPublic,
      submissionCount: problem.submissionCount,
      acceptedSubmissionCount: problem.acceptedSubmissionCount,
    };
  }

  public async getProblemList(
    sortBy: 'id' | 'title' | 'submissionCount' | 'acceptedSubmissionCount',
    order: 'ASC' | 'DESC',
    skipCount: number,
    takeCount: number,
    tagIds: number[],
    currentUser: UserEntity,
  ): Promise<[problems: ProblemEntity[], count: number]> {
    const problemQueryBuilder = this.problemRepository
      .createQueryBuilder()
      .orderBy(sortBy, order)
      .skip(skipCount)
      .take(takeCount)
      .where('permission IN (:permissions)', {
        permissions: this.userCanViewProblemPermissions(currentUser),
      });
    if (!currentUser.isManager) {
      problemQueryBuilder.andWhere('isPublic = :isPublic', { isPublic: true });
    }
    if (tagIds && tagIds.length) {
      const tagMapQuery = this.problemTagMapRepository
        .createQueryBuilder()
        .select('problemId')
        .where('problemTagId IN (:tagIds)', { tagIds })
        .getQuery();
      problemQueryBuilder.andWhere(`id IN (${tagMapQuery})`);
    }
    return await problemQueryBuilder.getManyAndCount();
  }
}
