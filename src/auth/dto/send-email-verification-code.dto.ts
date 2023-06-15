import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";

import { CE_Language, languages } from "@/common/locales";

export abstract class PostSendEmailVerificationCodeRequestBodyDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsIn(languages)
  readonly lang: CE_Language;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly password?: string;
}
