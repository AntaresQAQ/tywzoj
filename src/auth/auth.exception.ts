import { HttpStatus } from "@nestjs/common";

import { CE_ErrorCode } from "@/common/error-code";
import { AppHttpException } from "@/common/exception";

export class NoSuchUserException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.NOT_FOUND, CE_ErrorCode.Auth_NoSuchUser, msg ?? "No such user.");
  }
}

export class WrongPasswordException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.FORBIDDEN, CE_ErrorCode.Auth_WrongPassword, msg ?? "Wrong password.");
  }
}

export class AlreadyLoggedInException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Auth_AlreadyLoggedIn, msg ?? "Already logged in.");
  }
}

export class NotLoggedInException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Auth_NotLoggedIn, msg ?? "Not logged in.");
  }
}

export class DuplicateUsernameException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Auth_DuplicateUsername, msg ?? "Duplicate username.");
  }
}

export class DuplicateEmailException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Auth_DuplicateEmail, msg ?? "Duplicate email.");
  }
}

export class InvalidEmailVerificationCodeException extends AppHttpException {
  constructor(msg?: string) {
    super(
      HttpStatus.FORBIDDEN,
      CE_ErrorCode.Auth_InvalidEmailVerificationCode,
      msg ?? "Invalid email verification code.",
    );
  }
}

export class FailedToSendEmailVerificationCodeException extends AppHttpException {
  constructor(msg?: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      CE_ErrorCode.Auth_FailedToSendEmailVerificationCode,
      msg ?? "Failed to send email verification code.",
    );
  }
}

export class EmailVerificationCodeRateLimitedException extends AppHttpException {
  constructor(msg?: string) {
    super(
      HttpStatus.FORBIDDEN,
      CE_ErrorCode.Auth_EmailVerificationCodeRateLimited,
      msg ?? "Email verification code rate limited.",
    );
  }
}
