import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { readFileSync } from 'fs-extra';
import { load } from 'js-yaml';

import { AppConfig } from './config.schema';

export class ConfigService {
  public readonly config: AppConfig;

  constructor() {
    const filePath = process.env.TYWZOJ_CONFIG_FILE;
    if (!filePath) {
      throw new Error(
        'Please specify configuration file with environment variable TYWZOJ_CONFIG_FILE',
      );
    }

    const config = load(readFileSync(filePath).toString());
    this.config = ConfigService.validateInput(config);
  }

  private static validateInput(inputConfig: unknown): AppConfig {
    const appConfig = plainToClass(AppConfig, inputConfig);
    const errors = validateSync(appConfig, {
      validationError: {
        target: false,
      },
    });

    if (errors.length > 0) {
      throw new Error(`Config validation error: ${JSON.stringify(errors, null, 2)}`);
    }

    //checkConfigRelation(appConfig as unknown as Record<string, unknown>);

    return appConfig;
  }
}
