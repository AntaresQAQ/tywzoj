import { forwardRef, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [forwardRef(() => ConfigModule)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
