import { Injectable } from '@nestjs/common';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { join } from 'path';

import { ConfigService } from '@/config/config.service';

export enum MailTemplate {
  RegisterVerificationCode = 'register-verification-code',
  ResetPasswordVerificationCode = 'reset-password-verification-code',
  ChangeEmailVerificationCode = 'change-email-verification-code',
}

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport(
      this.configService.config.service.mail.transport,
    );
  }

  private async render(
    template: MailTemplate,
    data: Record<string, unknown>,
  ): Promise<[string, string]> {
    const templateFile = join(__dirname, 'templates', `${template}.ejs`);
    const renderResult = (
      await ejs.renderFile(templateFile, {
        ...data,
        siteName: this.configService.config.preference.siteName,
      })
    ).trim();
    const [subject, ...contentLines] = renderResult.split('\n');
    const content = contentLines.join('\n');
    return [subject, content];
  }

  /**
   * Send a template mail to an email address.
   *
   * @param template The template mail name
   * @param data The data to pass to the template
   * @param recipient The recipient email address
   * @returns The error message. Falsy on success.
   */
  async sendMail(
    template: MailTemplate,
    data: Record<string, unknown>,
    recipient: string,
  ): Promise<string> {
    const [subject, content] = await this.render(template, data);
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
