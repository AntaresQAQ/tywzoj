import { HttpException, HttpStatus } from "@nestjs/common";

import { CE_ErrorCode } from "./error-code";

export class AppHttpException extends HttpException {
  constructor(status: number, error: CE_ErrorCode | number, msg?: string) {
    super({ error, msg }, status);
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
