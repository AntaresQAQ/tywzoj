import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class PostResetForgotPasswordBodyDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly emailVerificationCode: string;

  @ApiProperty()
  @IsString()
  @Length(6, 32)
  readonly newPassword: string;
}

export class PostResetPasswordBodyDto {
  @ApiProperty()
  @IsNumber()
  userId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly oldPassword?: string;

  @ApiProperty()
  @IsString()
  @Length(6, 32)
  readonly newPassword: string;
}
