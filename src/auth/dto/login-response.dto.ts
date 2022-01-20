import { ApiProperty } from '@nestjs/swagger';

export enum LoginResponseError {
  ALREADY_LOGGED = 'ALREADY_LOGGED',
  NO_SUCH_USER = 'NO_SUCH_USER',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
}

export class LoginResponseDto {
  @ApiProperty({ enum: LoginResponseError })
  error?: LoginResponseError;

  @ApiProperty()
  token?: string;

  @ApiProperty()
  username?: string;
}
