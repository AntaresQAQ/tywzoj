import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CurrentUser } from '@/common/user.decorator';
import { UserEntity } from '@/user/user.entity';

import {
  GetProblemListRequestDto,
  GetProblemListResponseDto,
  GetProblemListResponseError,
} from './dto';
import { ProblemService } from './problem.service';

@ApiTags('Problem')
@Controller('problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

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
    if (currentUser.isBlocked)
      return { error: GetProblemListResponseError.PERMISSION_DENIED };
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
        problems.map(problem => this.problemService.getProblemMeta(problem, currentUser)),
      ),
    };
  }
}
