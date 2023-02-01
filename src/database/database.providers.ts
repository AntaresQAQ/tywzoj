import { TypeOrmModule } from "@nestjs/typeorm";

import { ConfigService } from "@/config/config.service";

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      type: configService.config.service.database.type,
      host: configService.config.service.database.host,
      port: configService.config.service.database.port,
      username: configService.config.service.database.username,
      password: configService.config.service.database.password,
      database: configService.config.service.database.database,
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      logging: process.env.TYWZOJ_LOG_SQL !== "0",
      synchronize: true,
      charset: "utf8mb4",
    }),
    inject: [ConfigService],
  }),
];
