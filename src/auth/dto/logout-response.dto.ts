import { ApiProperty } from '@nestjs/swagger';

export enum LogoutResponseError {
  NOT_LOGGED = 'NOT_LOGGED',
}

export class LogoutResponseDto {
  @ApiProperty({ enum: LogoutResponseError })
  error?: LogoutResponseError;

  @ApiProperty({ default: 'SUCCESS' })
  status?: 'SUCCESS';
}
