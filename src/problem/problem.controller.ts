import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthRequiredException, PermissionDeniedException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { CE_Permissions, checkIsAllowed } from "@/common/user-level";
import { ConfigService } from "@/config/config.service";
import { UserEntity } from "@/user/user.entity";

import { GetProblemListRequestQueryDto, GetProblemListResponseDto } from "./dto/problem-list.dto";
import { TakeTooManyException } from "./problem.exception";
import { ProblemService } from "./problem.service";

@ApiTags("Problem")
@Controller("problem")
export class ProblemController {
  constructor(private readonly configService: ConfigService, private readonly problemService: ProblemService) {}

  @Get("list")
  @ApiOperation({
    summary: "A HTTP GET request to get list of problem which can be saw by current user",
  })
  @ApiBearerAuth()
  async getProblemListAsync(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetProblemListRequestQueryDto,
  ): Promise<GetProblemListResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    if (!checkIsAllowed(currentUser.level, CE_Permissions.AccessSite)) throw new PermissionDeniedException();
    if (query.takeCount > this.configService.config.queryLimit.problem) throw new TakeTooManyException();

    const tagIds =
      query.tagIds &&
      query.tagIds
        .trim()
        .split(",")
        .map(x => Number(x.trim()))
        .filter(x => Number.isSafeInteger(x));

    const [problems, count] = await this.problemService.findProblemListAsync(
      query.sortBy,
      query.order,
      query.skipCount,
      query.takeCount,
      query.keyword,
      tagIds,
      currentUser,
    );

    if (query.keyword && query.keywordMatchesId) {
      const matchDisplayId = Number.isSafeInteger(Number(query.keyword)) ? Number(query.keyword) || 0 : 0;
      if (!problems.some(problem => problem.id === matchDisplayId)) {
        const problem = await this.problemService.findProblemByDisplayIdAsync(matchDisplayId);
        if (problem && this.problemService.checkIsAllowedView(problem, currentUser)) problems.unshift(problem);
        while (problems.length > query.takeCount) problems.pop();
      }
    }

    return {
      count: count,
      problems: await Promise.all(
        problems.map(problem => this.problemService.getProblemBaseDetailAsync(problem, query.queryTags)),
      ),
    };
  }
}
