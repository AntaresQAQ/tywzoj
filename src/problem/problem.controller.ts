import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Recaptcha } from "@nestlab/google-recaptcha";

import { AuthRequiredException, PermissionDeniedException, TakeTooManyException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { ConfigService } from "@/config/config.service";
import { ProblemFileEntity } from "@/problem/problem-file.entity";
import { UserEntity } from "@/user/user.entity";

import {
  GetProblemDetailByDisplayIdRequestParamDto,
  GetProblemDetailByDisplayIdRequestQueryDto,
  GetProblemDetailByDisplayIdResponseDto,
  GetProblemDetailRequestParamDto,
  GetProblemDetailRequestQueryDto,
  GetProblemDetailResponseDto,
} from "./dto/problem.detail.dto";
import { GetProblemListRequestQueryDto, GetProblemListResponseDto } from "./dto/problem.list.dto";
import {
  PostProblemFileUploadedReportRequestBodyDto,
  PostProblemFileUploadedReportResponseDto,
  PostProblemFileUploadRequestRequestBodyDto,
  PostProblemFileUploadRequestResponseDto,
} from "./dto/problem-file.dto";
import { GetProblemFilesRequestParamDto, GetProblemFilesResponseDto } from "./dto/problem-file.list.dto";
import { ProblemTagDetailDto, ProblemTagTypeDetailDto } from "./dto/problem-tag.dto";
import {
  GetProblemTagsRequestParamDto,
  GetProblemTagsRequestQueryDto,
  GetProblemTagsResponseDto,
  GetProblemTagTypeListRequestQueryDto,
  GetProblemTagTypeListResponseDto,
} from "./dto/problem-tag.list.dto";
import { NoSuchProblemException } from "./problem.exception";
import { ProblemService } from "./problem.service";
import { ProblemFileService } from "./problem-file.service";
import { E_ProblemFileType } from "./problem-file.type";
import { ProblemTagService } from "./problem-tag.service";

@ApiTags("Problem")
@Controller("problem")
export class ProblemController {
  constructor(
    private readonly configService: ConfigService,
    private readonly problemService: ProblemService,
    private readonly problemTagService: ProblemTagService,
    private readonly problemFileService: ProblemFileService,
  ) {}

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

  @Get("detailByDisplayId/:displayId")
  @ApiOperation({
    summary: "A HTTP GET request to get problem detail.",
  })
  @ApiBearerAuth()
  async getProblemDetailByDisplayIdAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: GetProblemDetailByDisplayIdRequestParamDto,
    @Query() query: GetProblemDetailByDisplayIdRequestQueryDto,
  ): Promise<GetProblemDetailByDisplayIdResponseDto> {
    if (!currentUser) throw new AuthRequiredException();

    const problem = await this.problemService.findProblemByDisplayIdAsync(param.displayId);
    if (!problem) throw new NoSuchProblemException();

    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();

    const { queryTags = false } = query;

    return await this.problemService.getProblemDetailAsync(problem, queryTags);
  }

  @Get("detail/:id")
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

    const problem = await this.problemService.findProblemByIdAsync(param.id);
    if (!problem) throw new NoSuchProblemException();

    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();

    const { queryTags = false } = query;

    return await this.problemService.getProblemDetailAsync(problem, queryTags);
  }

  @Get("detail/:id/tags")
  @ApiOperation({
    summary: "A HTTP GET request to get problem tags.",
  })
  @ApiBearerAuth()
  async getProblemDetailTagsAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: GetProblemTagsRequestParamDto,
    @Query() query: GetProblemTagsRequestQueryDto,
  ): Promise<GetProblemTagsResponseDto> {
    if (!currentUser) throw new AuthRequiredException();

    const { id } = param;
    const { queryType = false } = query;
    const problem = await this.problemService.findProblemByIdAsync(id);
    if (!problem) throw new NoSuchProblemException();
    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();

    const tagEntities = await this.problemTagService.findProblemTagListByProblemIdAsync(problem.id);

    let tags: ProblemTagDetailDto[];
    if (queryType) {
      tags = await Promise.all(tagEntities.map(tag => this.problemTagService.getProblemTagDetailAsync(tag)));
    } else {
      tags = tagEntities.map(tag => this.problemTagService.getProblemTagBaseDetail(tag));
    }

    return { tags };
  }

  @Get("detail/:id/files")
  @ApiOperation({
    summary: "A HTTP GET request to get problem files.",
  })
  async getProblemDetailFilesAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: GetProblemFilesRequestParamDto,
  ): Promise<GetProblemFilesResponseDto> {
    const { id } = param;
    const problem = await this.problemService.findProblemByIdAsync(id);
    if (!problem) throw new NoSuchProblemException();
    if (!this.problemService.checkIsAllowedView(problem, currentUser)) throw new PermissionDeniedException();
    let fileEntities: ProblemFileEntity[];

    if (this.problemService.checkIsAllowedManage(problem, currentUser)) {
      fileEntities = await this.problemFileService.findProblemFilesByProblemIdAsync(problem.id);
    } else {
      fileEntities = await this.problemFileService.findProblemFilesByProblemIdAsync(
        problem.id,
        E_ProblemFileType.AdditionalFile,
      );
    }

    return {
      files: await Promise.all(fileEntities.map(file => this.problemFileService.getProblemFileDetailAsync(file))),
    };
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
    const tagTypeEntities = await this.problemTagService.findProblemTagTypeListAsync();

    let tagTypes: ProblemTagTypeDetailDto[];
    if (queryTags) {
      tagTypes = await Promise.all(
        tagTypeEntities.map(tagType => this.problemTagService.getProblemTagTypeDetailAsync(tagType)),
      );
    } else {
      tagTypes = tagTypeEntities.map(tagType => this.problemTagService.getProblemTagTypeBaseDetail(tagType));
    }

    return { tagTypes };
  }

  @Post("file/uploadRequest")
  @ApiOperation({
    summary: "A HTTP POST request to sign a file upload request.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async postProblemFileUploadRequestAsync(
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostProblemFileUploadRequestRequestBodyDto,
  ): Promise<PostProblemFileUploadRequestResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    const { problemId, filename, size, type } = body;
    const problem = await this.problemService.findProblemByIdAsync(problemId);
    if (!problem) throw new NoSuchProblemException();
    if (!this.problemService.checkIsAllowedManage(problem, currentUser)) throw new PermissionDeniedException();

    const token = this.problemFileService.encodeProblemFileUploadToken({ problemId, filename, size, type });
    const uploadRequest = await this.problemFileService.signProblemFileUploadRequestAsync(
      problemId,
      type,
      filename,
      size,
    );

    return { uploadRequest, token };
  }

  @Post("file/uploadedReport")
  @ApiOperation({
    summary: "A HTTP POST request to report a file uploaded.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async postProblemFileUploadedReportAsync(
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostProblemFileUploadedReportRequestBodyDto,
  ): Promise<PostProblemFileUploadedReportResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    const { problemId, filename, type } = this.problemFileService.decodeProblemFileUploadToken(body.token);
    const problem = await this.problemService.findProblemByIdAsync(problemId);
    if (!problem) throw new NoSuchProblemException();
    if (!this.problemService.checkIsAllowedManage(problem, currentUser)) throw new PermissionDeniedException();

    return await this.problemFileService.reportProblemFileUploadedAsync(problem, filename, body.uuid, type);
  }
}
