import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

import { HttpPatch } from "@/common/types";
import { CE_UserLevel } from "@/common/user-level";
import { IsUsername } from "@/common/validators";
import { CE_UserGender, IUserEntity } from "@/user/user.types";

import { UserDetailDto } from "./user.dto";

export class UserDetailRequestParamDto {
  @ApiProperty()
  @IsInt()
  readonly id: number;
}

export class PatchUserDetailRequestBodyDto implements HttpPatch<IUserEntity> {
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
  information?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(CE_UserLevel.Blocked)
  @Max(CE_UserLevel.Admin)
  readonly level?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([CE_UserGender.Male, CE_UserGender.Female, CE_UserGender.Other])
  readonly gender?: CE_UserGender;
}

export class GetUserDetailResponseDto extends UserDetailDto {}
export class PatchUserDetailResponseDto extends UserDetailDto {}
