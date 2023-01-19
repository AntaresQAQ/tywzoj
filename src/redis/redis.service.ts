/* eslint-disable @typescript-eslint/naming-convention */
// https://github.com/lyrio-dev/lyrio/blob/2b448a28a3f652b9bcb2502a10ba37c7b408fefe/src/redis/redis.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";

import { ConfigService } from "@/config/config.service";

const REDIS_CACHE_EXPIRE_TIME = 60 * 60 * 24 * 30; // 7 days

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly client: Redis;

  private readonly untilReady: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis(this.configService.config.service.redis, {
      enableReadyCheck: true,
    });

    this.untilReady = new Promise((resolve, reject) => {
      this.client.once("ready", resolve);
      this.client.once("error", reject);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.untilReady;
    } catch (e) {
      throw new Error(`Could not connect to Redis service: ${e}`);
    }
  }

  async cacheSet(key: string, value: string): Promise<void> {
    await this.client.setex(key, REDIS_CACHE_EXPIRE_TIME, value);
  }

  async cacheGet(key: string): Promise<string> {
    return await this.client.get(key);
  }

  async cacheDelete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Get a Redis client object to execute Redis commands directly.
   *
   * Please use `cacheGet` and `cacheSet` for caching since they handle the expire time automatically.
   */
  getClient(): Redis {
    return this.client.duplicate();
  }
}
