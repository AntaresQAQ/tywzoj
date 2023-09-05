import { Global, Module } from "@nestjs/common";

import { RecaptchaFilter } from "./recaptcha.filter";
import { recaptchaProviders } from "./recaptcha.providers";

@Global()
@Module({
    imports: [...recaptchaProviders],
    exports: [...recaptchaProviders],
    providers: [RecaptchaFilter],
})
export class RecaptchaModule {}
