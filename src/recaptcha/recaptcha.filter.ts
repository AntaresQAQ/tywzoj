import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { GoogleRecaptchaException } from "@nestlab/google-recaptcha";
import { Response } from "express";

import { CE_ErrorCode } from "@/common/error-code";

@Catch(GoogleRecaptchaException)
export class RecaptchaFilter implements ExceptionFilter {
  catch(exception: GoogleRecaptchaException, host: ArgumentsHost) {
    if (host.getType() === "http") {
      const response = host.switchToHttp().getResponse<Response>();
      response.status(HttpStatus.BAD_REQUEST).send({
        code: CE_ErrorCode.RecaptchaError,
        msg: "Recaptcha Error",
      });
    }
  }
}
