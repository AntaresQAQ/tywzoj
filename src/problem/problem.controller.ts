import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthRequiredException, PermissionDeniedException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { CE_Permissions, checkIsAllowed } from "@/common/user-level";
import { ConfigService } from "@/config/config.service";
import { UserEntity } from "@/user/user.entity";

import {
  GetProblemDetailRequestParamDto,
  GetProblemDetailRequestQueryDto,
  GetProblemDetailResponseDto,
} from "./dto/problem.detail.dto";
import { GetProblemListRequestQueryDto, GetProblemListResponseDto } from "./dto/problem.list.dto";
import { GetProblemTagListResponseDto } from "./dto/problem-tag.list.dto";
import { NoSuchProblemException, TakeTooManyException } from "./problem.exception";
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

  @Get("detail/:displayId")
  @ApiOperation({
    summary: "A HTTP GET request to get problem detail.",
  })
  @ApiBearerAuth()
  async getProblemDetailAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: GetProblemDetailRequestParamDto,
    @Query() query: GetProblemDetailRequestQueryDto,
  ): Promise<GetProblemDetailResponseDto> {
    if (!currentUser) throw new AuthRequiredException();

    const problem = await this.problemService.findProblemByDisplayIdAsync(param.displayId);
    if (!problem) throw new NoSuchProblemException();

    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();

    const { queryTags = false } = query;

    const problemDetail: GetProblemDetailResponseDto = {
      problemDetail: await this.problemService.getProblemDetailAsync(problem, queryTags, currentUser),
    };

    if (queryTags) {
      const tagTypes = await this.problemService.findProblemTagTypeListAsync();
      problemDetail.tagTypeDetails = tagTypes.map(tagType => this.problemService.getProblemTagTypeDetail(tagType));
    }

    return problemDetail;
  }

  @Get("tag/list")
  @ApiOperation({
    summary: "A HTTP GET request to get problem tag list.",
  })
  @ApiBearerAuth()
  async getProblemTagListAsync(@CurrentUser() currentUser: UserEntity): Promise<GetProblemTagListResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    if (!checkIsAllowed(currentUser.level, CE_Permissions.AccessSite)) throw new PermissionDeniedException();

    const problemTags = await this.problemService.findProblemTagListAsync();
    const problemTagTypes = await this.problemService.findProblemTagTypeListAsync();

    return {
      tagsDetails: problemTags.map(tag => this.problemService.getProblemTagDetail(tag)),
      tagTypeDetails: problemTagTypes.map(tagType => this.problemService.getProblemTagTypeDetail(tagType)),
    };
  }
}
