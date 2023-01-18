import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { CE_UserLevel } from "@/common/user-level";
import { CE_UserGender, IUserBaseEntityWithExtra, IUserEntityWithExtra } from "@/user/user.types";

export class UserBaseDetailDto implements IUserBaseEntityWithExtra {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  information?: string;

  @ApiProperty()
  level: CE_UserLevel;

  @ApiPropertyOptional()
  nickname?: string;

  @ApiProperty()
  avatar: string;
}

export class UserDetailDto extends UserBaseDetailDto implements IUserEntityWithExtra {
  @ApiPropertyOptional()
  gender?: CE_UserGender;

  @ApiProperty()
  acceptedProblemCount: number;

  @ApiProperty()
  submissionCount: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  registrationTime: Date;
}
