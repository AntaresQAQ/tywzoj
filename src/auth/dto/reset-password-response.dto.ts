import { ApiProperty } from '@nestjs/swagger';

export enum ResetPasswordResponseError {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_SUCH_USER = 'NO_SUCH_USER',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  NOT_LOGGED = 'NOT_LOGGED',
  ALREADY_LOGGED = 'ALREADY_LOGGED',
  INVALID_EMAIL_VERIFICATION_CODE = 'INVALID_EMAIL_VERIFICATION_CODE',
}

export class ResetPasswordResponseDto {
  @ApiProperty()
  error?: ResetPasswordResponseError;

  @ApiProperty({ default: 'SUCCESS' })
  status?: 'SUCCESS';
}
