import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CurrentUser } from '@/common/user.decorator';
import { ConfigService } from '@/config/config.service';
import { UserEntity } from '@/user/user.entity';

import {
  GetUserDetailRequestDto,
  GetUserDetailResponseDto,
  GetUserDetailResponseError,
  GetUserListRequestDto,
  GetUserListResponseDto,
  GetUserListResponseError,
} from './dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(readonly userService: UserService, readonly configService: ConfigService) {}

  @Post('getUserDetail')
  @ApiOperation({
    summary: 'A request to get user meta.',
    description: 'Recaptcha required.',
  })
  @ApiBearerAuth()
  async getUserDetail(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: GetUserDetailRequestDto,
  ): Promise<GetUserDetailResponseDto> {
    if (!currentUser) return { error: GetUserDetailResponseError.NOT_LOGGED };
    if (currentUser.isBlocked) return { error: GetUserDetailResponseError.PERMISSION_DENIED };
    const user = await this.userService.findUserById(request.id);
    if (!user) return { error: GetUserDetailResponseError.NO_SUCH_USER };
    return {
      userMeta: await this.userService.getUserMeta(user, currentUser),
    };
  }

  @Post('getUserList')
  @ApiOperation({
    summary: 'A request to get user list.',
  })
  @ApiBearerAuth()
  async getUserList(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: GetUserListRequestDto,
  ): Promise<GetUserListResponseDto> {
    if (!currentUser) return { error: GetUserListResponseError.NOT_LOGGED };
    if (currentUser.isBlocked) return { error: GetUserListResponseError.PERMISSION_DENIED };
    if (request.takeCount > this.configService.config.queryLimit.userList)
      return {
        error: GetUserListResponseError.TAKE_TOO_MANY,
      };
    const [users, count] = await this.userService.getUserList(
      request.sortBy,
      request.skipCount,
      request.takeCount,
    );
    return {
      userMetas: await Promise.all(
        users.map(user => this.userService.getUserMeta(user, currentUser)),
      ),
      count,
    };
  }
}
