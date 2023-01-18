import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { cidrSubnet, SubnetInfo } from "ip";
import { RateLimiterAbstract, RateLimiterMemory } from "rate-limiter-flexible";

import { ConfigService } from "@/config/config.service";

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly enabled: boolean;
  private readonly rateLimiter: RateLimiterAbstract;
  private readonly whitelist: SubnetInfo[];

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.config.security.rateLimit.enabled;
    if (this.enabled) {
      this.rateLimiter = new RateLimiterMemory({
        points: this.configService.config.security.rateLimit.maxRequests,
        duration: this.configService.config.security.rateLimit.durationSeconds,
      });
      this.whitelist = this.configService.config.security.rateLimit.whitelist.map(value => cidrSubnet(value));
    }
  }

  use(req: Request, res: Response, next: () => void) {
    if (this.enabled) {
      if (this.whitelist.find(cidr => cidr.contains(req.ip))) {
        next();
      } else {
        this.rateLimiter
          .consume(req.ip)
          .then(() => next())
          .catch(() => res.status(429).send("Too Many Requests"));
      }
    } else {
      next();
    }
  }
}
