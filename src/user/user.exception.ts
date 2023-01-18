import { HttpStatus } from "@nestjs/common";

import { CE_ErrorCode } from "@/common/error-code";
import { AppHttpException } from "@/common/exception";

export class TakeTooManyException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.User_TakeTooMany, msg ?? "Take too many.");
  }
}

export class NoSuchUserException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.NOT_FOUND, CE_ErrorCode.User_NoSuchUser, msg ?? "No such user.");
  }
}
