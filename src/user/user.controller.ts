import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Recaptcha } from "@nestlab/google-recaptcha";

import { AuthSessionService } from "@/auth/auth-session.service";
import { AuthRequiredException, PermissionDeniedException, TakeTooManyException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { isEmptyValues } from "@/common/utils";
import { ConfigService } from "@/config/config.service";
import { GetUserSearchResponseDto, UserSearchRequestQueryDto } from "@/user/dto/user.search.dto";
import {
    PatchUserPreferenceRequestBodyDto,
    UserPreferenceRequestParamDto,
    UserPreferenceResponseDto,
} from "@/user/dto/user-preference.dto";

import {
    GetUserDetailResponseDto,
    PatchUserDetailRequestBodyDto,
    PatchUserDetailResponseDto,
    UserDetailRequestParamDto,
} from "./dto/user.detail.dto";
import { GetUserListRequestQueryDto, GetUserListResponseDto } from "./dto/user.list.dto";
import { UserEntity } from "./user.entity";
import { NoSuchUserException } from "./user.exception";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller("user")
export class UserController {
    constructor(
        readonly userService: UserService,
        readonly configService: ConfigService,
        private readonly authSessionService: AuthSessionService,
    ) {}

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
            users: await Promise.all(users.map((user) => this.userService.getUserDetail(user, currentUser))),
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
    @Recaptcha()
    async patchUserDetailAsync(
        @CurrentUser() currentUser: UserEntity,
        @Param() param: UserDetailRequestParamDto,
        @Body() body: PatchUserDetailRequestBodyDto,
    ): Promise<PatchUserDetailResponseDto> {
        if (!currentUser) throw new AuthRequiredException();

        const user = await this.userService.findUserByIdAsync(param.id);
        if (!user) throw new NoSuchUserException();

        if (!this.userService.checkIsAllowedEdit(user, currentUser)) throw new PermissionDeniedException();

        if (
            !isEmptyValues(body.username, body.email, body.level) &&
            !this.userService.checkIsAllowedManage(user, currentUser)
        ) {
            throw new PermissionDeniedException();
        }

        await this.userService.updateUserAsync(user.id, body);

        return this.userService.getUserDetail(await this.userService.findUserByIdAsync(user.id), currentUser);
    }

    @Delete("detail/:id")
    @ApiOperation({
        summary: "A HTTP DELETE request to delete user.",
    })
    async deleteUserDetailAsync(@CurrentUser() currentUser: UserEntity, @Param() param: UserDetailRequestParamDto) {
        if (!currentUser) throw new AuthRequiredException();

        const user = await this.userService.findUserByIdAsync(param.id);
        if (!user) throw new NoSuchUserException();

        if (!this.userService.checkIsAllowedManage(user, currentUser)) throw new PermissionDeniedException();

        await this.userService.deleteUserAsync(user);
        await this.authSessionService.revokeAllSessionsExceptAsync(param.id, null);
    }

    @Get("preference/:id")
    @ApiOperation({
        summary: "A HTTP PATCH request to update user preference.",
    })
    @ApiBearerAuth()
    async getUserPreferenceAsync(
        @CurrentUser() currentUser: UserEntity,
        @Param() param: UserPreferenceRequestParamDto,
    ): Promise<UserPreferenceResponseDto> {
        if (!currentUser) throw new AuthRequiredException();
        const user = await this.userService.findUserByIdAsync(param.id);
        if (!user) throw new NoSuchUserException();

        return await this.userService.getUserPreferenceAsync(user);
    }

    @Patch("preference/:id")
    @ApiOperation({
        summary: "A HTTP PATCH request to update user preference.",
    })
    @ApiBearerAuth()
    @Recaptcha()
    async patchUserPreferenceAsync(
        @CurrentUser() currentUser: UserEntity,
        @Param() param: UserPreferenceRequestParamDto,
        @Body() body: PatchUserPreferenceRequestBodyDto,
    ): Promise<UserPreferenceResponseDto> {
        if (!currentUser) throw new AuthRequiredException();
        const user = await this.userService.findUserByIdAsync(param.id);

        if (!user) throw new NoSuchUserException();
        if (!this.userService.checkIsAllowedEdit(user, currentUser)) throw new PermissionDeniedException();

        await this.userService.updateUserPreferenceAsync(user.id, body);

        return await this.userService.getUserPreferenceAsync(user);
    }

    @Get("search")
    @ApiOperation({
        summary: "A HTTP GET request to search user base detail.",
    })
    @ApiBearerAuth()
    async getUserSearchAsync(@Query() query: UserSearchRequestQueryDto): Promise<GetUserSearchResponseDto> {
        const { key, strict = false } = query;
        if (strict) {
            const user = await this.userService.findUserByUsernameAsync(key);
            if (!user) throw new NoSuchUserException();
            return {
                users: [this.userService.getUserAtomicDetail(user)],
            };
        } else {
            return {
                users: (
                    await this.userService.searchUsersByUsernameAsync(
                        key,
                        this.configService.config.queryLimit.searchUser,
                    )
                ).map(this.userService.getUserAtomicDetail),
            };
        }
    }
}
