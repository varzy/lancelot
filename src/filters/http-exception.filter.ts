/**
 * <https://docs.nestjs.com/exception-filters#exception-filters-1>
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
      message: exception.message,
    };

    Logger.error(JSON.stringify(errorBody), 'ExceptionFilter');

    response.status(status).json(errorBody);
  }
}
