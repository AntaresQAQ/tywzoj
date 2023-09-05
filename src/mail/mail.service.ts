import { Injectable } from "@nestjs/common";
import ejs from "ejs";
import nodemailer from "nodemailer";
import { join } from "path";

import { CE_Language } from "@/common/locales";
import { ConfigService } from "@/config/config.service";

export const enum CE_MailTemplate {
    RegisterVerificationCode = "register-verification-code",
    ResetPasswordVerificationCode = "reset-password-verification-code",
    ChangeEmailVerificationCode = "change-email-verification-code",
}

@Injectable()
export class MailService {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport(this.configService.config.service.mail.transport);
    }

    private async renderAsync(
        template: CE_MailTemplate,
        lang: CE_Language,
        data: Record<string, unknown>,
    ): Promise<[string, string]> {
        const templateFile = join(__dirname, "templates", lang, `${template}.ejs`);
        const renderResult = (
            await ejs.renderFile(templateFile, {
                ...data,
                siteName: this.configService.config.preference.siteName,
            })
        ).trim();
        const [subject, ...contentLines] = renderResult.split("\n");
        const content = contentLines.join("\n");
        return [subject, content];
    }

    /**
     * Send a template mail to an email address.
     *
     * @param template The template mail name
     * @param lang The language of the template
     * @param data The data to pass to the template
     * @param recipient The recipient email address
     * @returns The error message. Falsy on success.
     */
    async sendMailAsync(
        template: CE_MailTemplate,
        lang: CE_Language,
        data: Record<string, unknown>,
        recipient: string,
    ): Promise<string> {
        const [subject, content] = await this.renderAsync(template, lang, data);
        try {
            await this.transporter.sendMail({
                from: `${this.configService.config.preference.siteName} <${this.configService.config.service.mail.address}>`,
                to: recipient,
                subject,
                html: content,
            });
            return null;
        } catch (e) {
            return String(e);
        }
    }
}
