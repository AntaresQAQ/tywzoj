import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthRequiredException, PermissionDeniedException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { isEmptyValues } from "@/common/utils";
import { ConfigService } from "@/config/config.service";

import {
  GetUserDetailResponseDto,
  PatchUserDetailRequestBodyDto,
  PatchUserDetailResponseDto,
  UserDetailRequestParamDto,
} from "./dto/user-detail.dto";
import { GetUserListRequestQueryDto, GetUserListResponseDto } from "./dto/user-list.dto";
import { UserEntity } from "./user.entity";
import { NoSuchUserException, TakeTooManyException } from "./user.exception";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(readonly userService: UserService, readonly configService: ConfigService) {}

  @Get("list")
  @ApiOperation({
    summary: "A HTTP GET request to get user list.",
  })
  @ApiBearerAuth()
  async getUserListAsync(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetUserListRequestQueryDto,
  ): Promise<GetUserListResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    if (!this.userService.checkIsAllowedView(currentUser)) throw new PermissionDeniedException();

    if (query.takeCount > this.configService.config.queryLimit.userList) throw new TakeTooManyException();

    const [users, count] = await this.userService.findUserListAsync(query.sortBy, query.skipCount, query.takeCount);

    return {
      users: await Promise.all(users.map(user => this.userService.getUserDetail(user, currentUser))),
      count,
    };
  }

  @Get("detail/:id")
  @ApiOperation({
    summary: "A HTTP GET request to get user detail.",
  })
  @ApiBearerAuth()
  async getUserDetailAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: UserDetailRequestParamDto,
  ): Promise<GetUserDetailResponseDto> {
    if (!currentUser) throw new AuthRequiredException();
    if (!this.userService.checkIsAllowedView(currentUser)) throw new PermissionDeniedException();

    const user = await this.userService.findUserByIdAsync(param.id);
    if (!user) throw new NoSuchUserException();

    return this.userService.getUserDetail(user, currentUser);
  }

  @Patch("detail/:id")
  @ApiOperation({
    summary: "A HTTP PATCH request to update user detail.",
  })
  @ApiBearerAuth()
  async patchUserDetailAsync(
    @CurrentUser() currentUser: UserEntity,
    @Param() param: UserDetailRequestParamDto,
    @Body() body: PatchUserDetailRequestBodyDto,
  ): Promise<PatchUserDetailResponseDto> {
    if (!currentUser) throw new AuthRequiredException();

    const user = await this.userService.findUserByIdAsync(param.id);
    if (!user) throw new NoSuchUserException();

    if (!this.userService.checkIsAllowedEdit(user, currentUser)) throw new PermissionDeniedException();

    if (!isEmptyValues(body.username, body.email, body.level) && !this.userService.checkIsAllowedManage(currentUser)) {
      throw new PermissionDeniedException();
    }

    await this.userService.updateUserAsync(user.id, body);

    return this.userService.getUserDetail(await this.userService.findUserByIdAsync(user.id), currentUser);
  }
}
