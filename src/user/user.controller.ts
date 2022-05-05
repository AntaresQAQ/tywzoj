import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CurrentUser } from '@/common/user.decorator';
import { UserEntity } from '@/user/user.entity';

import {
  GetUserInfoRequestDto,
  GetUserInfoResponseDto,
  GetUserInfoResponseError,
} from './dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Recaptcha()
  @Post('getUserInfo')
  @ApiOperation({
    summary: 'A request to get user information',
  })
  @ApiBearerAuth()
  async getUserInfo(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: GetUserInfoRequestDto,
  ): Promise<GetUserInfoResponseDto> {
    if (!currentUser) return { error: GetUserInfoResponseError.NOT_LOGGED };
    if (currentUser.isBlocked)
      return { error: GetUserInfoResponseError.PERMISSION_DENIED };
    const user = await this.userService.findUserById(request.id);
    if (!user) return { error: GetUserInfoResponseError.NO_SUCH_USER };
    return {
      userMeta: await this.userService.getUserMeta(user, currentUser),
      userStatistics: await this.userService.getUserStatistics(user),
    };
  }
}
