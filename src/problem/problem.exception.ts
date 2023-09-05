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

export class TooManyFileUploadRequestException extends AppHttpException {
    constructor(msg?: string) {
        super(
            HttpStatus.TOO_MANY_REQUESTS,
            CE_ErrorCode.Problem_TooManyFileUploadRequest,
            msg ?? "Too many file upload request.",
        );
    }
}

export class TooLargeUploadFileException extends AppHttpException {
    constructor(msg?: string) {
        super(HttpStatus.BAD_REQUEST, CE_ErrorCode.Problem_TooLargeUploadFile, msg ?? "Too large upload file.");
    }
}

export class FileLimitExceededException extends AppHttpException {
    constructor(msg?: string) {
        super(HttpStatus.FORBIDDEN, CE_ErrorCode.Problem_FileLimitExceeded, msg ?? "File limit exceeded.");
    }
}
