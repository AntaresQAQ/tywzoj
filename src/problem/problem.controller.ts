import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthRequiredException, PermissionDeniedException, TakeTooManyException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { ConfigService } from "@/config/config.service";
import { ProblemTagDetailDto, ProblemTagTypeDetailDto } from "@/problem/dto/problem-tag.dto";
import { UserEntity } from "@/user/user.entity";

import {
  GetProblemDetailByIdRequestParamDto,
  GetProblemDetailByIdRequestQueryDto,
  GetProblemDetailRequestParamDto,
  GetProblemDetailRequestQueryDto,
  GetProblemDetailResponseDto,
} from "./dto/problem.detail.dto";
import { GetProblemListRequestQueryDto, GetProblemListResponseDto } from "./dto/problem.list.dto";
import {
  GetProblemTagListRequestQueryDto,
  GetProblemTagListResponseDto,
  GetProblemTagTypeListRequestQueryDto,
  GetProblemTagTypeListResponseDto,
} from "./dto/problem-tag.list.dto";
import { NoSuchProblemException } from "./problem.exception";
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
    if (!this.problemService.checkIsAllowedAccess(currentUser)) throw new PermissionDeniedException();
    if (query.takeCount > this.configService.config.queryLimit.problem) throw new TakeTooManyException();

    const tagIds = query.tagIds && query.tagIds.filter(x => Number.isSafeInteger(x));

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
        problems.map(problem => this.problemService.getProblemBaseDetailAsync(problem, query.queryTags ?? false)),
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

    return await this.problemService.getProblemDetailAsync(problem, queryTags);
  }

  @Get("detailById/:id")
  @ApiOperation({
    summary: "A HTTP GET request to get problem detail.",
  })
  @ApiBearerAuth()
  async getProblemDetailByIdAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: GetProblemDetailByIdRequestParamDto,
    @Query() query: GetProblemDetailByIdRequestQueryDto,
  ): Promise<GetProblemDetailResponseDto> {
    if (!currentUser) throw new AuthRequiredException();

    const problem = await this.problemService.findProblemByDisplayIdAsync(param.id);
    if (!problem) throw new NoSuchProblemException();

    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();

    const { queryTags = false } = query;

    return await this.problemService.getProblemDetailAsync(problem, queryTags);
  }

  @Get("tag/list")
  @ApiOperation({
    summary: "A HTTP GET request to get problem tags.",
  })
  @ApiBearerAuth()
  async getProblemDetailTagListByIdAsync(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetProblemTagListRequestQueryDto,
  ): Promise<GetProblemTagListResponseDto> {
    if (!currentUser) throw new AuthRequiredException();

    const { problemId, queryType = false } = query;
    const problem = await this.problemService.findProblemByIdAsync(problemId);
    if (!problem) throw new NoSuchProblemException();
    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();

    const tagEntities = await this.problemService.findProblemTagListByProblemIdAsync(problem.id);
    console.log(tagEntities);

    let tags: ProblemTagDetailDto[];
    if (queryType) {
      tags = await Promise.all(tagEntities.map(tag => this.problemService.getProblemTagDetailAsync(tag)));
    } else {
      tags = tagEntities.map(tag => this.problemService.getProblemTagBaseDetail(tag));
    }

    return { tags };
  }

  @Get("tagType/list")
  @ApiOperation({
    summary: "A HTTP GET request to get problem tag list.",
  })
  @ApiBearerAuth()
  async getProblemTagListAsync(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetProblemTagTypeListRequestQueryDto,
  ): Promise<GetProblemTagTypeListResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    if (!this.problemService.checkIsAllowedAccess(currentUser)) throw new PermissionDeniedException();

    const { queryTags = false } = query;
    const tagTypeEntities = await this.problemService.findProblemTagTypeListAsync();

    let tagTypes: ProblemTagTypeDetailDto[];
    if (queryTags) {
      tagTypes = await Promise.all(
        tagTypeEntities.map(tagType => this.problemService.getProblemTagTypeDetailAsync(tagType)),
      );
    } else {
      tagTypes = tagTypeEntities.map(tagType => this.problemService.getProblemTagTypeBaseDetail(tagType));
    }

    return { tagTypes };
  }
}
