import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@/config/config.module';
import { DatabaseModule } from '@/database/database.module';
import { RecaptchaModule } from '@/recaptcha/recaptcha.module';
import { RedisModule } from '@/redis/redis.module';
import { UserModule } from '@/user/user.module';

import { AppService } from './app.service';
import { ErrorFilter } from './error.filter';

@Module({
  imports: [
    ConfigModule,
    RecaptchaModule,
    forwardRef(() => DatabaseModule),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RedisModule),
  ],
  providers: [AppService, ErrorFilter],
})
export class AppModule {}
