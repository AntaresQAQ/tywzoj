import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AuthMiddleware } from '@/auth/auth.middleware';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@/config/config.module';
import { DatabaseModule } from '@/database/database.module';
import { UserModule } from '@/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ErrorFilter } from './error.filter';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DatabaseModule),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RedisModule),
  ],
  controllers: [AppController],
  providers: [AppService, ErrorFilter],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
