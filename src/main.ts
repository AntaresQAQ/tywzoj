import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import getGitRepoInfo from "git-repo-info";
import moment from "moment";

import { AppModule } from "@/app.module";
import { ValidationErrorException } from "@/common/exception";
import { ConfigService } from "@/config/config.service";
import { ErrorFilter } from "@/error.filter";
import { RecaptchaFilter } from "@/recaptcha/recaptcha.filter";

export const appGitRepoInfo = getGitRepoInfo();

async function bootstrapAsync() {
    // Get package info
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageInfo = require("../package.json");
    const appVersion = `v${packageInfo.version}`;
    const gitRepoVersion = appGitRepoInfo.sha
        ? ` (Git revision ${appGitRepoInfo.sha.substring(0, 8)} on ${moment(appGitRepoInfo.committerDate).format(
              "YYYY-MM-DD H:mm:ss",
          )})`
        : "";

    Logger.log(`Starting ${packageInfo.name} version ${appVersion}${gitRepoVersion}`, "Bootstrap");

    // Create nestjs app
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ trustProxy: "loopback" }),
    );
    const configService = app.get(ConfigService);
    app.setGlobalPrefix("api");
    app.useGlobalFilters(app.get(ErrorFilter), app.get(RecaptchaFilter));
    app.useGlobalPipes(
        new ValidationPipe({
            always: true,
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => new ValidationErrorException(errors),
        }),
    );
    app.useBodyParser("application/json", { bodyLimit: 1024 * 1024 * 1024 });

    // Configure CORS
    if (configService.config.security.crossOrigin.enabled) {
        app.enableCors({
            origin: configService.config.security.crossOrigin.whitelist.map((item) =>
                item.startsWith("regex:") ? new RegExp(item.substring(6)) : item,
            ),
            optionsSuccessStatus: 200,
            maxAge: 7200,
        });
    }

    // Configure swagger
    Logger.log(`Setting up Swagger API document builder`, "Bootstrap");

    const options = new DocumentBuilder()
        .setTitle(packageInfo.name)
        .setDescription(packageInfo.description)
        .setVersion(appVersion)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("/docs", app, document);

    await app.listen(configService.config.server.port, configService.config.server.hostname);

    Logger.log(
        `${packageInfo.name} is listening on ${configService.config.server.hostname}:${configService.config.server.port}`,
        "Bootstrap",
    );
}

bootstrapAsync().catch((reason) => {
    console.error(reason);
});
