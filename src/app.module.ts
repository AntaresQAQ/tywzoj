import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { ArticleModule } from "@/article/article.module";
import { AuthModule } from "@/auth/auth.module";
import { ConfigModule } from "@/config/config.module";
import { DatabaseModule } from "@/database/database.module";
import { MailModule } from "@/mail/mail.module";
import { ProblemModule } from "@/problem/problem.module";
import { RecaptchaModule } from "@/recaptcha/recaptcha.module";
import { RedisModule } from "@/redis/redis.module";
import { UserModule } from "@/user/user.module";

import { ErrorFilter } from "./error.filter";
import { RateLimiterMiddleware } from "./rate-limiter.middleware";

@Module({
  imports: [
    ConfigModule,
    RecaptchaModule,
    forwardRef(() => DatabaseModule),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RedisModule),
    forwardRef(() => MailModule),
    forwardRef(() => ProblemModule),
    forwardRef(() => ArticleModule),
  ],
  providers: [ErrorFilter],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimiterMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
