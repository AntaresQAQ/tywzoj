import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { CE_UserLevel } from "@/common/user-level";
import {
  CE_UserGender,
  IUserAtomicEntityWithExtra,
  IUserBaseEntityWithExtra,
  IUserEntityWithExtra,
} from "@/user/user.types";

export class UserAtomicDetailDto implements IUserAtomicEntityWithExtra {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ nullable: true })
  avatar: string;
}

export class UserBaseDetailDto extends UserAtomicDetailDto implements IUserBaseEntityWithExtra {
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  information?: string;

  @ApiProperty()
  level: CE_UserLevel;

  @ApiPropertyOptional()
  nickname?: string;
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
