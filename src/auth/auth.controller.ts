import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Recaptcha } from "@nestlab/google-recaptcha";

import { PermissionDeniedException } from "@/common/exception";
import { CurrentUser } from "@/common/user.decorator";
import { ConfigService } from "@/config/config.service";
import { CE_MailTemplate, MailService } from "@/mail/mail.service";
import { appGitRepoInfo } from "@/main";
import { UserEntity } from "@/user/user.entity";
import { UserService } from "@/user/user.service";

import {
  AlreadyLoggedInException,
  DuplicateEmailException,
  FailedToSendEmailVerificationCodeException,
  InvalidEmailVerificationCodeException,
  NoSuchUserException,
  NotLoggedInException,
  WrongPasswordException,
} from "./auth.exception";
import { IRequestWithSession } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthSessionService } from "./auth-session.service";
import { AuthVerificationCodeService, CE_VerificationCodeType } from "./auth-verification-code.service";
import { PostLoginRequestBodyDto, PostLoginResponseDto } from "./dto/login.dto";
import { PostResetForgotPasswordBodyDto, PostResetPasswordBodyDto } from "./dto/reset-password.dto";
import { PostRegisterRequestBodyDto, PostRegisterResponseDto } from "./dto/resister.dto";
import { PostSendEmailVerificationCodeRequestBodyDto } from "./dto/send-email-verification-code.dto";
import { GetSessionInfoRequestQueryDto, GetSessionInfoResponseDto } from "./dto/session-info.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly authVerificationCodeService: AuthVerificationCodeService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @Get("sessionInfo")
  @ApiOperation({
    summary: "A HTTP GET request to get current user's info and server preference.",
  })
  async getSessionInfoAsync(@Query() query: GetSessionInfoRequestQueryDto): Promise<GetSessionInfoResponseDto> {
    const [, user] = await this.authSessionService.accessSessionAsync(query.token);

    return {
      serverVersion: {
        hash: appGitRepoInfo.abbreviatedSha,
        date: appGitRepoInfo.committerDate,
      },
      preference: this.configService.preferenceConfigToBeSentToUser,
      userBaseDetail: user && this.userService.getUserBaseDetail(user, user),
    };
  }

  @Post("login")
  @ApiOperation({
    summary: "A HTTP POST request to login.",
    description: "Recaptcha required.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async loginAsync(
    @Req() req: IRequestWithSession,
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostLoginRequestBodyDto,
  ): Promise<PostLoginResponseDto> {
    if (currentUser) throw new AlreadyLoggedInException();

    let user: UserEntity;

    if (body.username) {
      user = await this.userService.findUserByUsernameAsync(body.username);
    } else if (body.email) {
      user = await this.userService.findUserByEmailAsync(body.email);
    }

    if (!user) throw new NoSuchUserException();
    if (!this.authService.checkIsAllowedLogin(user)) throw new PermissionDeniedException();

    const auth = await this.authService.findAuthByUserIdAsync(user.id);
    if (!(await this.authService.checkPasswordAsync(auth, body.password))) throw new WrongPasswordException();

    return {
      token: await this.authSessionService.newSessionAsync(user, req.ip, req.headers["user-agent"]),
      userBaseDetail: this.userService.getUserBaseDetail(user, user),
    };
  }

  @Post("logout")
  @ApiOperation({
    summary: "A HTTP POST request to logout current session",
  })
  @ApiBearerAuth()
  async logoutAsync(@Req() req: IRequestWithSession) {
    const sessionKey = req?.session?.sessionKey;

    if (!sessionKey) throw new NotLoggedInException();

    await this.authSessionService.endSessionAsync(sessionKey);
  }

  @Post("register")
  @ApiOperation({
    summary: "A HTTP POST request to register a new user.",
    description: "Recaptcha required.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async registerAsync(
    @Req() req: IRequestWithSession,
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostRegisterRequestBodyDto,
  ): Promise<PostRegisterResponseDto> {
    if (currentUser) throw new AlreadyLoggedInException();

    const user = await this.authService.registerAsync(
      body.username,
      body.email,
      body.emailVerificationCode,
      body.password,
    );

    return {
      token: await this.authSessionService.newSessionAsync(user, req.ip, req.headers["user-agent"]),
      userBaseDetail: await this.userService.getUserBaseDetail(user, user),
    };
  }

  @Post("sendRegisterEmailVerificationCode")
  @ApiOperation({
    summary: "A HTTP POST request to send an email verification code to register.",
    description: "Recaptcha required.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async sendRegisterEmailVerificationCodeAsync(
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostSendEmailVerificationCodeRequestBodyDto,
  ) {
    if (!this.configService.config.preference.security.requireEmailVerification) {
      throw new FailedToSendEmailVerificationCodeException("Email verification code disabled.");
    }
    if (currentUser) throw new AlreadyLoggedInException();

    if (!(await this.userService.checkEmailAvailabilityAsync(body.email))) {
      throw new DuplicateEmailException();
    }

    const code = await this.authVerificationCodeService.generateAsync(CE_VerificationCodeType.Register, body.email);
    await this.mailService.sendMailAsync(CE_MailTemplate.RegisterVerificationCode, { code }, body.email);
  }

  @Post("sendChangeEmailVerificationCode")
  @ApiOperation({
    summary: "A HTTP POST request to send an email verification code to change email.",
    description: "Recaptcha required.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async sendChangeEmailVerificationCodeAsync(
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostSendEmailVerificationCodeRequestBodyDto,
  ) {
    if (!this.configService.config.preference.security.requireEmailVerification) {
      throw new FailedToSendEmailVerificationCodeException("Email verification code disabled.");
    }
    if (!currentUser) throw new NotLoggedInException();
    if (!this.authService.checkIsAllowedLogin(currentUser)) throw new PermissionDeniedException();

    const auth = await this.authService.findAuthByUserIdAsync(currentUser.id);
    if (!(await this.authService.checkPasswordAsync(auth, body.password ?? ""))) throw new WrongPasswordException();
    if (!(await this.userService.checkEmailAvailabilityAsync(body.email))) throw new DuplicateEmailException();

    const code = await this.authVerificationCodeService.generateAsync(CE_VerificationCodeType.ChangeEmail, body.email);
    await this.mailService.sendMailAsync(CE_MailTemplate.ChangeEmailVerificationCode, { code }, body.email);
  }

  @Post("sendResetPasswordEmailVerificationCode")
  @ApiOperation({
    summary: "A HTTP POST request to send an email verification code to reset password.",
    description: "Recaptcha required.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async sendResetPasswordEmailVerificationCodeAsync(
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostSendEmailVerificationCodeRequestBodyDto,
  ) {
    if (!this.configService.config.preference.security.requireEmailVerification) {
      throw new FailedToSendEmailVerificationCodeException("Email verification code disabled.");
    }

    const user = currentUser || (await this.userService.findUserByEmailAsync(body.email));
    if (!user) throw new NoSuchUserException();
    if (!this.authService.checkIsAllowedLogin(currentUser)) throw new PermissionDeniedException();

    const code = await this.authVerificationCodeService.generateAsync(
      CE_VerificationCodeType.ResetPassword,
      body.email,
    );
    await this.mailService.sendMailAsync(CE_MailTemplate.ResetPasswordVerificationCode, { code }, body.email);
  }

  @Post("resetForgotPassword")
  @ApiOperation({
    summary: "A HTTP POST request to reset a forgot password.",
    description: "Recaptcha required.",
  })
  @Recaptcha()
  async resetForgotPasswordAsync(@Body() body: PostResetForgotPasswordBodyDto) {
    const user = await this.userService.findUserByEmailAsync(body.email);
    if (!user) throw new NoSuchUserException();
    if (!this.authService.checkIsAllowedLogin(user)) throw new PermissionDeniedException();
    if (
      !(await this.authVerificationCodeService.verifyAsync(
        CE_VerificationCodeType.ResetPassword,
        body.email,
        body.emailVerificationCode,
      ))
    ) {
      throw new InvalidEmailVerificationCodeException();
    }

    const auth = await user.authPromise;
    await this.authService.changePasswordAsync(auth, body.newPassword);
    await this.authSessionService.revokeAllSessionsExceptAsync(user.id, null);
  }

  @Post("resetPassword")
  @ApiOperation({
    summary: "A HTTP POST request to reset the password.",
    description: "Recaptcha required.",
  })
  @ApiBearerAuth()
  @Recaptcha()
  async resetPasswordAsync(
    @Req() req: IRequestWithSession,
    @CurrentUser() currentUser: UserEntity,
    @Body() body: PostResetPasswordBodyDto,
  ) {
    if (!currentUser) throw new NotLoggedInException();
    const user = (body.userId && (await this.userService.findUserByIdAsync(body.userId))) || currentUser;
    if (!user) throw new NoSuchUserException();
    const auth = await user.authPromise;

    if (user.id === currentUser.id) {
      if (!this.authService.checkIsAllowedLogin(currentUser)) throw new PermissionDeniedException();
      if (!(await this.authService.checkPasswordAsync(auth, body.oldPassword))) throw new WrongPasswordException();
      await this.authSessionService.revokeAllSessionsExceptAsync(user.id, req.session.sessionId);
    } else {
      if (!this.userService.checkIsAllowedManage(user, currentUser)) throw new PermissionDeniedException();
      await this.authSessionService.revokeAllSessionsExceptAsync(user.id, null);
    }
    await this.authService.changePasswordAsync(auth, body.newPassword);
  }
}
