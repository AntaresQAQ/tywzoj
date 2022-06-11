import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/user.decorator';
import { ConfigService } from '@/config/config.service';
import { UserEntity } from '@/user/user.entity';

import {
  GetProblemDetailRequestDto,
  GetProblemDetailResponseDto,
  GetProblemDetailResponseError,
  GetProblemListRequestDto,
  GetProblemListResponseDto,
  GetProblemListResponseError,
  GetProblemTagListError,
  GetProblemTagListResponseDto,
} from './dto';
import { ProblemService } from './problem.service';
import { ProblemTagType } from './problem-tag.entity';

@ApiTags('Problem')
@Controller('problem')
export class ProblemController {
  constructor(
    private readonly configService: ConfigService,
    private readonly problemService: ProblemService,
  ) {}

  @ApiOperation({
    summary: 'A request to get list of problem which can be saw by current user',
  })
  @Post('getProblemList')
  async getProblemList(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: GetProblemListRequestDto,
  ): Promise<GetProblemListResponseDto> {
    if (!currentUser) return { error: GetProblemListResponseError.NOT_LOGGED };
    if (currentUser.isBlocked) return { error: GetProblemListResponseError.PERMISSION_DENIED };
    if (request.takeCount > this.configService.config.queryLimit.problem)
      return { error: GetProblemListResponseError.TAKE_TOO_MANY };

    const [problems, count] = await this.problemService.getProblemList(
      request.sortBy,
      request.order,
      request.skipCount,
      request.takeCount,
      request.keyword,
      request.tagIds,
      currentUser,
    );

    if (request.keyword && request.keywordMatchesId) {
      const matchDisplayId = Number.isSafeInteger(Number(request.keyword))
        ? Number(request.keyword) || 0
        : 0;
      if (!problems.some(problem => problem.id === matchDisplayId)) {
        const problem = await this.problemService.findProblemByDisplayId(matchDisplayId);
        if (problem && this.problemService.problemIsAllowedView(problem, currentUser))
          problems.unshift(problem);
        while (problems.length > request.takeCount) problems.pop();
      }
    }

    return {
      count: count,
      problemMetas: await Promise.all(
        problems.map(problem =>
          this.problemService.getProblemMeta(problem, request.showTags, true, currentUser),
        ),
      ),
    };
  }

  @ApiOperation({
    summary: 'A request to get problem detail',
  })
  @Post('getProblemDetail')
  async getProblemDetail(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: GetProblemDetailRequestDto,
  ): Promise<GetProblemDetailResponseDto> {
    if (!currentUser) return { error: GetProblemDetailResponseError.NOT_LOGGED };
    const problem = await this.problemService.findProblemByDisplayId(request.displayId);
    if (!problem) return { error: GetProblemDetailResponseError.NO_SUCH_PROBLEM };
    if (!this.problemService.problemIsAllowedView(problem, currentUser))
      return { error: GetProblemDetailResponseError.PERMISSION_DENIED };
    return {
      problemMeta: await this.problemService.getProblemMeta(problem, true, false, currentUser),
      problemContent: await this.problemService.getProblemContent(problem, currentUser),
    };
  }

  @ApiOperation({
    summary: 'A request to get all tags',
  })
  @Post('getProblemTagList')
  async getProblemTagList(
    @CurrentUser() currentUser: UserEntity,
  ): Promise<GetProblemTagListResponseDto> {
    if (!currentUser) return { error: GetProblemTagListError.NOT_LOGGED };
    if (currentUser.isBlocked) return { error: GetProblemTagListError.PERMISSION_DENIED };
    const algorithmTags = await this.problemService.getProblemTagList(ProblemTagType.Algorithm);
    const datetimeTags = await this.problemService.getProblemTagList(ProblemTagType.Datetime);
    const originTags = await this.problemService.getProblemTagList(ProblemTagType.Origin);
    const otherTags = await this.problemService.getProblemTagList(ProblemTagType.Other);
    return {
      algorithmTagMetas: algorithmTags.map(tag => this.problemService.getProblemTagMeta(tag)),
      datetimeTagMetas: datetimeTags.map(tag => this.problemService.getProblemTagMeta(tag)),
      originTagMetas: originTags.map(tag => this.problemService.getProblemTagMeta(tag)),
      otherTagsMetas: otherTags.map(tag => this.problemService.getProblemTagMeta(tag)),
    };
  }
}
