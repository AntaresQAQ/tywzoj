import { ApiProperty } from '@nestjs/swagger';

import { UserMetaDto, UserStatisticsDto } from '.';

export enum GetUserInfoResponseError {
  NOT_LOGGED = 'NOT_LOGGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_SUCH_USER = 'NO_SUCH_USER',
}

export class GetUserInfoResponseDto {
  @ApiProperty({ enum: GetUserInfoResponseError })
  error?: GetUserInfoResponseError;

  @ApiProperty()
  userMeta?: UserMetaDto;

  @ApiProperty()
  userStatistics?: UserStatisticsDto;
}
