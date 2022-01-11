import { ApiProperty } from '@nestjs/swagger';

export enum SendVerificationCodeResponseError {
  PERMISSION_DENIED = 'PERMISSION_DENIED', // Change email
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL', // Change email and Register
  NO_SUCH_USER = 'NO_SUCH_USER', // Reset password
  ALREADY_LOGGED = 'ALREADY_LOGGED', // Register
  FAILED_TO_SEND = 'FAILED_TO_SEND',
  RATE_LIMITED = 'RATE_LIMITED',
}

export class SendVerificationCodeResponseDto {
  @ApiProperty({ enum: SendVerificationCodeResponseError })
  error?: SendVerificationCodeResponseError;

  @ApiProperty({ default: 'SUCCESS' })
  status?: string;
}
