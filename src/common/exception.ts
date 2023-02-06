import { HttpException, HttpStatus } from "@nestjs/common";
import { ValidationError } from "class-validator";

import { isProduction } from "@/common/utils";

import { CE_ErrorCode } from "./error-code";

export class AppHttpException extends HttpException {
  constructor(status: number, code: CE_ErrorCode | number, msg?: string, extra?: unknown) {
    super({ code, msg, extra }, status);
  }
}

export class AuthRequiredException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.UNAUTHORIZED, CE_ErrorCode.AuthRequired, msg ?? "Login requirement.");
  }
}

export class PermissionDeniedException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.FORBIDDEN, CE_ErrorCode.PermissionDenied, msg ?? "Permission denied.");
  }
}

export class ValidationErrorException extends AppHttpException {
  constructor(validationErrors: ValidationError[]) {
    super(
      HttpStatus.BAD_REQUEST,
      CE_ErrorCode.ValidationError,
      "Validation Error",
      isProduction() ? undefined : validationErrors,
    );
  }
}

export class TakeTooManyException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.TakeTooMany, msg ?? "Take too many.");
  }
}
