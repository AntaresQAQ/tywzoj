import { GoogleRecaptchaModule, GoogleRecaptchaNetwork } from '@nestlab/google-recaptcha';

import { RequestWithSession } from '@/auth/auth.middleware';
import { ConfigModule } from '@/config/config.module';
import { ConfigService } from '@/config/config.service';

export const recaptchaProviders = [
  GoogleRecaptchaModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      secretKey: configService.config.security.recaptcha.secretKey,
      response: (req: RequestWithSession) => String(req.headers['x-recaptcha-token']),
      skipIf: () => !configService.config.preference.security.recaptchaEnabled,
      network: configService.config.security.recaptcha.useRecaptchaNet
        ? GoogleRecaptchaNetwork.Recaptcha
        : GoogleRecaptchaNetwork.Google,
    }),
    inject: [ConfigService],
  }),
];
