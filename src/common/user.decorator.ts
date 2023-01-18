import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { IRequestWithSession } from "@/auth/auth.middleware";

/**
 * See auth/auth.middleware.ts for request.session
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: IRequestWithSession = ctx.switchToHttp().getRequest();
  return request.session?.user;
});
