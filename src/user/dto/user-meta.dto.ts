import { ApiProperty } from '@nestjs/swagger';

import { UserGender, UserType } from '../user.entity';

export class UserMetaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ nullable: true })
  email: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  information: string;

  @ApiProperty({ enum: UserGender, nullable: true })
  gender: UserGender;

  @ApiProperty()
  avater: string;

  @ApiProperty({ enum: UserType, default: UserType.GENERAL })
  type: UserType;

  @ApiProperty()
  registrationTime: Date;
}