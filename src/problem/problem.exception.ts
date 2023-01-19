import { HttpStatus } from "@nestjs/common";

import { CE_ErrorCode } from "@/common/error-code";
import { AppHttpException } from "@/common/exception";

export class TakeTooManyException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Problem_TakeTooMany, msg ?? "Take too many.");
  }
}
