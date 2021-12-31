import { ApiProperty } from '@nestjs/swagger';

import { UserMetaDto } from '@/user/dto';

export class ServerVersionDto {
  @ApiProperty()
  hash: string;

  @ApiProperty()
  date: string;
}

export class GetSessionInfoResponseDto {
  @ApiProperty()
  userMeta?: UserMetaDto;

  @ApiProperty()
  serverVersion: ServerVersionDto;
}
