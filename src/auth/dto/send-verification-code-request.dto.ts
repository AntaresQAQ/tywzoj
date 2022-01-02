import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

import { VerificationCodeType } from '../auth-verification-code.service';

export class SendVerificationCodeRequestDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ enum: VerificationCodeType })
  @IsEnum(VerificationCodeType)
  readonly type: VerificationCodeType;
}
