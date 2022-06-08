import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CurrentUser } from '@/common/user.decorator';
import { ConfigService } from '@/config/config.service';
import { UserEntity } from '@/user/user.entity';

import {
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
    description: 'Recaptcha required.',
  })
  @Recaptcha()
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
      request.tagIds,
      currentUser,
    );

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
    summary: 'A request to get all tags',
    description: 'Recaptcha required.',
  })
  @Recaptcha()
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
