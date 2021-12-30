import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const contextType = host.getType();
    if (contextType === 'http') {
      const response = host.switchToHttp().getResponse<Response>();
      if (error instanceof HttpException)
        response.status(error.getStatus()).send(error.getResponse());
      else
        response.status(500).send({
          error: String(error),
          stack: error?.stack,
        });
    }
  }
}
