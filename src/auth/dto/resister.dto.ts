import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

import { PostLoginResponseDto } from "@/auth/dto/login.dto";
import { IsUsername } from "@/common/validators";

export class PostRegisterRequestBodyDto {
  @ApiProperty()
  @IsUsername()
  readonly username: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly emailVerificationCode?: string;

  @ApiProperty()
  @IsString()
  @Length(6, 32)
  readonly password: string;
}

export class PostRegisterResponseDto extends PostLoginResponseDto {}
