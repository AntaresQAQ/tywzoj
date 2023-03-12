import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

import { HttpPatch } from "@/common/types";
import { CE_UserLevel } from "@/common/user-level";
import { IsUsername } from "@/common/validators";
import { IUserEntity } from "@/user/user.types";

import { UserDetailDto } from "./user.dto";

export abstract class UserDetailRequestParamDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly id: number;
}

export abstract class PatchUserDetailRequestBodyDto implements HttpPatch<IUserEntity> {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUsername()
  readonly username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(24)
  readonly nickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly information?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(CE_UserLevel.Blocked)
  @Max(CE_UserLevel.Admin)
  readonly level?: number;
}

export abstract class GetUserDetailResponseDto extends UserDetailDto {}
export abstract class PatchUserDetailResponseDto extends UserDetailDto {}
