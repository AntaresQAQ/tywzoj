import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

import { IsUsername } from "@/common/validators";
import { UserBaseDetailDto } from "@/user/dto/user.dto";

export class PostLoginRequestBodyDto {
  @ApiProperty()
  @IsUsername()
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

export class PostLoginResponseDto {
  @ApiProperty()
  token?: string;

  @ApiProperty()
  userBaseDetail?: UserBaseDetailDto;
}
