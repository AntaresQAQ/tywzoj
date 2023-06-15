import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

import { CE_ErrorCode } from "@/common/error-code";
import { AppHttpException } from "@/common/exception";

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const contextType = host.getType();
    if (contextType === "http") {
      const response = host.switchToHttp().getResponse<Response>();
      if (error instanceof AppHttpException) response.status(error.getStatus()).send(error.getResponse());
      else if (error instanceof HttpException) {
        const body = error.getResponse();
        response.status(error.getStatus()).send({
          code: CE_ErrorCode.Unknown,
          ...(typeof body === "string" && { msg: body }),
          ...(typeof body === "object" && { extra: body }),
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          code: CE_ErrorCode.ServerError,
          msg: String(error),
          extra: error?.stack,
        });
      }
    }
  }
}
