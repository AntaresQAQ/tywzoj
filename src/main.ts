import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import getGitRepoInfo from 'git-repo-info';
import moment from 'moment';
import util from 'util';

import { RecaptchaFilter } from '@/recaptcha/recaptcha.filter';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ErrorFilter } from './error.filter';

// eslint-disable-next-line no-extend-native
String.prototype.format = function format(...args) {
  return util.format.call(undefined, this, ...args);
};

export const appGitRepoInfo = getGitRepoInfo();

async function bootstrap() {
  // Get package info
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageInfo = require('../package.json');
  const appVersion = `v${packageInfo.version}`;
  const gitRepoVersion = appGitRepoInfo.sha
    ? ` (Git revision ${appGitRepoInfo.sha.substring(0, 8)} on ${moment(
        appGitRepoInfo.committerDate,
      ).format('YYYY-MM-DD H:mm:ss')})`
    : '';

  Logger.log(
    `Starting ${packageInfo.name} version ${appVersion}${gitRepoVersion}`,
    'Bootstrap',
  );

  // Create nestjs app
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(app.get(ErrorFilter), app.get(RecaptchaFilter));
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(json({ limit: '1024mb' }));
  app.set('trust proxy', configService.config.server.trustProxy);

  // Configure CORS
  if (configService.config.security.crossOrigin.enabled) {
    app.enableCors({
      origin: configService.config.security.crossOrigin.whiteList,
      optionsSuccessStatus: 200,
    });
  }

  // Configure swagger
  Logger.log(`Setting up Swagger API document builder`, 'Bootstrap');

  const options = new DocumentBuilder()
    .setTitle(packageInfo.name)
    .setDescription(packageInfo.description)
    .setVersion(appVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(
    configService.config.server.port,
    configService.config.server.hostname,
  );

  Logger.log(
    `${packageInfo.name} is listening on ${configService.config.server.hostname}:${configService.config.server.port}`,
    'Bootstrap',
  );
}

bootstrap().catch(reason => {
  console.error(reason);
});
