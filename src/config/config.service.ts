import { instanceToInstance, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { readFileSync } from "fs-extra";
import { load } from "js-yaml";

import { AppConfig, PreferenceConfig } from "./config.schema";
import { checkConfigRelation } from "./config-relation.decorator";

export class ConfigService {
  readonly config: AppConfig;
  readonly preferenceConfigToBeSentToUser: PreferenceConfig;

  constructor() {
    const filePath = process.env.TYWZOJ_CONFIG_FILE;
    if (!filePath) {
      throw new Error("Please specify configuration file with environment variable TYWZOJ_CONFIG_FILE");
    }

    const config = load(readFileSync(filePath).toString());
    this.config = ConfigService.validateInput(config);
    this.preferenceConfigToBeSentToUser = instanceToInstance(this.config.preference);
  }

  private static validateInput(inputConfig: unknown): AppConfig {
    const appConfig = plainToInstance(AppConfig, inputConfig);
    const errors = validateSync(appConfig, {
      validationError: {
        target: false,
      },
    });

    if (errors.length > 0) {
      throw new Error(`Config validation error: ${JSON.stringify(errors, null, 2)}`);
    }

    checkConfigRelation(appConfig as unknown as Record<string, unknown>);

    return appConfig;
  }
}
