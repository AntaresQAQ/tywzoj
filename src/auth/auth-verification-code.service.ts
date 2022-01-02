import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { customAlphabet } from 'nanoid/async';

import { RedisService } from '@/redis/redis.service';

const RATE_LIMIT = 60;
const CODE_VALID_TIME = 60 * 15;

const REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT =
  'email-verification-code-rate-limit:%s';
const REDIS_KEY_EMAIL_VERIFICATION_CODE = 'email-verification-code:%s:%s';

export enum VerificationCodeType {
  Register = 'Register',
  ChangeEmail = 'ChangeEmail',
  ResetPassword = 'ResetPassword',
}

@Injectable()
export class AuthVerificationCodeService {
  private readonly redis: Redis;
  private readonly generateCode: () => Promise<string>;

  constructor(
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
    this.generateCode = customAlphabet('1234567890', 6);
  }

  async generate(email: string): Promise<string> {
    // If rate limit key already exists it will fail
    if (
      !(await this.redis.set(
        REDIS_KEY_EMAIL_VERIFICATION_CODE_RATE_LIMIT.format(email),
        '1',
        'EX',
        RATE_LIMIT,
        'NX',
      ))
    ) {
      return null;
    }

    const code = await this.generateCode();

    await this.redis.set(
      REDIS_KEY_EMAIL_VERIFICATION_CODE.format(email, code),
      '1',
      'EX',
      CODE_VALID_TIME,
    );

    return code;
  }

  async verify(email: string, code: string): Promise<boolean> {
    return !!(await this.redis.get(
      REDIS_KEY_EMAIL_VERIFICATION_CODE.format(email, code),
    ));
  }

  async revoke(email: string, code: string): Promise<void> {
    await this.redis.del(REDIS_KEY_EMAIL_VERIFICATION_CODE.format(email, code));
  }
}
