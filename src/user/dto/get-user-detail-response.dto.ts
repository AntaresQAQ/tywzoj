import { ApiProperty } from '@nestjs/swagger';

import { UserMetaDto } from '.';

export enum GetUserDetailResponseError {
  NOT_LOGGED = 'NOT_LOGGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_SUCH_USER = 'NO_SUCH_USER',
}

export class GetUserDetailResponseDto {
  @ApiProperty({ enum: GetUserDetailResponseError })
  error?: GetUserDetailResponseError;

  @ApiProperty()
  userMeta?: UserMetaDto;
}
