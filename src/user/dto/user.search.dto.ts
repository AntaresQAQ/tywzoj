import { ApiProperty } from "@nestjs/swagger";
import { IsBooleanString, IsOptional, IsString } from "class-validator";

import { UserAtomicDetailDto } from "@/user/dto/user.dto";

export class UserSearchRequestQueryDto {
  @ApiProperty()
  @IsString()
  readonly key: string;

  @ApiProperty()
  @IsOptional()
  @IsBooleanString()
  readonly strict: boolean;
}

export class GetUserSearchResponseDto {
  @ApiProperty()
  users: UserAtomicDetailDto[];
}
