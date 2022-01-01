import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { RequestWithSession } from '@/auth/auth.middleware';
import { AuthService } from '@/auth/auth.service';
import { CurrentUser } from '@/common/user.decorator';
import { ConfigService } from '@/config/config.service';
import { appGitRepoInfo } from '@/main';
import { UserEntity } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { AuthSessionService } from './auth-session.service';
import {
  GetSessionInfoRequestDto,
  GetSessionInfoResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  LoginResponseError,
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
    private readonly configService: ConfigService,
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
      preference: this.configService.preferenceConfigToBeSentToUser,
    };

    if (user) {
      result.userMeta = await this.userService.getUserMeta(user, user);
    }

    return result;
  }

  @Recaptcha()
  @Post('login')
  @ApiOperation({
    summary: 'A request to login',
  })
  @ApiBearerAuth()
  async login(
    @Req() req: RequestWithSession,
    @CurrentUser() currentUser: UserEntity,
    @Body() request: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    if (currentUser) return { error: LoginResponseError.ALREADY_LOGGED };

    let user: UserEntity;

    if (request.username) {
      user = await this.userService.findUserByUsername(request.username);
    } else if (request.email) {
      user = await this.userService.findUserByEmail(request.email);
    } else {
      return { error: LoginResponseError.NO_SUCH_USER };
    }
    if (!user) return { error: LoginResponseError.NO_SUCH_USER };
    const auth = await this.authService.findAuthByUserId(user.id);
    if (!(await this.authService.checkPassword(auth, request.password))) {
      return { error: LoginResponseError.WRONG_PASSWORD };
    }
    return {
      token: await this.authSessionService.newSession(
        user,
        req.ip,
        req.headers['user-agent'],
      ),
      username: user.username,
    };
  }

  @Recaptcha()
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
    if (currentUser) return { error: RegisterResponseError.ALREADY_LOGGED };

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
