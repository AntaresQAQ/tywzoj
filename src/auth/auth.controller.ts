import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestWithSession } from '@/auth/auth.middleware';
import { AuthService } from '@/auth/auth.service';
import { CurrentUser } from '@/common/user.decorator';
import { appGitRepoInfo } from '@/main';
import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { AuthSessionService } from './auth-session.service';
import {
  GetSessionInfoRequestDto,
  GetSessionInfoResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RegisterResponseError,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly userService: UserService,
  ) {}

  @Get('getSessionInfo')
  @ApiOperation({
    summary: "A request to get current user's info and server preference",
  })
  async getSessionInfo(
    @Query() request: GetSessionInfoRequestDto,
  ): Promise<GetSessionInfoResponseDto> {
    const [, user] = await this.authSessionService.accessSession(request.token);
    const result: GetSessionInfoResponseDto = {
      serverVersion: {
        hash: appGitRepoInfo.abbreviatedSha,
        date: appGitRepoInfo.committerDate,
      },
    };

    if (user) {
      result.userMeta = await this.userService.getUserMeta(user, user);
    }

    return result;
  }

  @Post('register')
  @ApiOperation({
    summary: 'A request to register a new user',
  })
  @ApiBearerAuth()
  async register(
    @Req() req: RequestWithSession,
    @CurrentUser() currentUser: UserEntity,
    @Body() request: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    if (currentUser) {
      return {
        error: RegisterResponseError.ALREADY_LOGGED,
      };
    }

    const [error, user] = await this.authService.register(
      request.username,
      request.email,
      request.emailVerificationCode,
      request.password,
    );

    if (error) return { error };

    return {
      token: await this.authSessionService.newSession(
        user,
        req.ip,
        req.headers['user-agent'],
      ),
    };
  }
}
