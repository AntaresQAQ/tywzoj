import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

import { UserBaseDetailDto } from "@/user/dto/user.dto";

export abstract class PostLoginRequestBodyDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly username?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty()
  @IsString()
  readonly password: string;
}

export abstract class PostLoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  userBaseDetail: UserBaseDetailDto;
}
