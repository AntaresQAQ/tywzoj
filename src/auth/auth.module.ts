import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from '@/redis/redis.module';
import { UserModule } from '@/user/user.module';

import { AuthEntity } from './auth.entity';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    forwardRef(() => RedisModule),
    forwardRef(() => UserModule),
  ],
  exports: [AuthService, AuthSessionService],
  providers: [AuthService, AuthSessionService],
})
export class AuthModule {}
