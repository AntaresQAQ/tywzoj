import { ApiProperty } from '@nestjs/swagger';

import { UserMetaDto } from '.';

export enum GetUserListResponseError {
  NOT_LOGGED = 'NOT_LOGGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TAKE_TOO_MANY = 'TAKE_TOO_MANY',
}

export class GetUserListResponseDto {
  @ApiProperty()
  error?: GetUserListResponseError;

  @ApiProperty({ type: UserMetaDto })
  userMetas?: UserMetaDto[];

  @ApiProperty()
  count?: number;
}
