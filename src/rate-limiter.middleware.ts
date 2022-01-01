import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { RateLimiterAbstract, RateLimiterMemory } from 'rate-limiter-flexible';

import { ConfigService } from '@/config/config.service';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly rateLimiter: RateLimiterAbstract;
  constructor(private readonly configService: ConfigService) {
    if (this.configService.config.security.rateLimit.enabled) {
      this.rateLimiter = new RateLimiterMemory({
        points: this.configService.config.security.rateLimit.maxRequests,
        duration: this.configService.config.security.rateLimit.durationSeconds,
      });
    }
  }
  use(req: Request, res: Response, next: () => void) {
    if (this.rateLimiter) {
      this.rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => res.status(429).send('Too Many Requests'));
    } else {
      next();
    }
  }
}
