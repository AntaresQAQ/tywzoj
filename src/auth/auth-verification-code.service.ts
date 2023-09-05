import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { customAlphabet } from "nanoid/async";

import { EmailVerificationCodeRateLimitedException } from "@/auth/auth.exception";
import { format } from "@/common/utils";
import { RedisService } from "@/redis/redis.service";

const RATE_LIMIT = 60;
const CODE_VALID_TIME = 60 * 15;

const REDIS_KEY_CODE_RATE_LIMIT = "verification-code-rate-limit:%s:%s"; // type:email
const REDIS_KEY_CODE = "verification-code:%s:%s:%s"; // type:email:code

export enum CE_VerificationCodeType {
    Register,
    ChangeEmail,
    ResetPassword,
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
        this.generateCode = customAlphabet("1234567890", 8);
    }

    async generateAsync(type: CE_VerificationCodeType, email: string): Promise<string> {
        const rateLimitKey = format(REDIS_KEY_CODE_RATE_LIMIT, type, email);

        const result = await this.redis.set(rateLimitKey, "1", "EX", RATE_LIMIT, "NX");

        // If rate limit key already exists it will fail
        if (result !== "OK") throw new EmailVerificationCodeRateLimitedException();

        const code = await this.generateCode();
        const codeKey = format(REDIS_KEY_CODE, type, email, code);

        await this.redis.set(codeKey, "1", "EX", CODE_VALID_TIME);

        return code;
    }

    async verifyAsync(type: CE_VerificationCodeType, email: string, code: string): Promise<boolean> {
        return !!(await this.redis.get(format(REDIS_KEY_CODE, type, email, code)));
    }

    async revokeAsync(type: CE_VerificationCodeType, email: string, code: string): Promise<void> {
        await this.redis.del(format(REDIS_KEY_CODE, type, email, code));
    }
}
