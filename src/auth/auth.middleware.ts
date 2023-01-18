import { Injectable, NestMiddleware } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import { Request, Response } from "express";

import { UserEntity } from "@/user/user.entity";

import { AuthSessionService } from "./auth-session.service";

const asyncLocalStorage = new AsyncLocalStorage();

export interface ISession {
  sessionKey?: string;
  sessionId?: number;
  user?: UserEntity;
}

export interface IRequestWithSession extends Request {
  session: ISession;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authSessionService: AuthSessionService) {}

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async use(req: IRequestWithSession, res: Response, next: () => void): Promise<void> {
    const authHeader = req.headers.authorization;
    const sessionKey = authHeader && authHeader.split(" ")[1];
    if (sessionKey) {
      const [sessionId, user] = await this.authSessionService.accessSessionAsync(sessionKey);
      if (user) {
        req.session = {
          sessionKey,
          sessionId,
          user,
        };
      }
    }

    asyncLocalStorage.run(req, () => next());
  }
}

/**
 * Get the current request object from async local storage.
 *
 * Calling it in a EventEmitter's callback may be not working since EventEmitter's callbacks
 * run in different contexts.
 */
export function getCurrentRequest(): IRequestWithSession {
  return asyncLocalStorage.getStore() as IRequestWithSession;
}
