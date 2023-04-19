import { HttpStatus } from "@nestjs/common";

import { CE_ErrorCode } from "@/common/error-code";
import { AppHttpException } from "@/common/exception";

export class NoSuchProblemException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.NOT_FOUND, CE_ErrorCode.Problem_NoSuchProblem, msg ?? "No such problem.");
  }
}

export class InvalidFileUploadTokenException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Problem_InvalidFileUploadToken, msg ?? "Invalid file upload token.");
  }
}
