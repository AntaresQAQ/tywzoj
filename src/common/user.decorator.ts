import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithSession } from '@/auth/auth.middleware';

/**
 * See auth/auth.middleware.ts for request.session
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithSession = ctx.switchToHttp().getRequest();
    return request.session?.user;
  },
);
