import { HttpStatus } from "@nestjs/common";

import { CE_ErrorCode } from "@/common/error-code";
import { AppHttpException } from "@/common/exception";

export class DuplicateUUIDException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.File_DuplicateUUID, msg ?? "Duplicate UUID.");
  }
}

export class FileNotUploadedException extends AppHttpException {
  constructor(msg?: string) {
    super(HttpStatus.BAD_REQUEST, CE_ErrorCode.File_FileNotUploaded, msg ?? "File not uploaded.");
  }
}
