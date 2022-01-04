import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

export enum ResetPasswordType {
  Force = 'Force',
  Common = 'Common',
  Forgetting = 'Forgetting',
}

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsEnum(ResetPasswordType)
  readonly type: ResetPasswordType;

  @ApiProperty()
  @IsEmail()
  @IsOptional() // Force and Forgetting
  readonly email?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional() // Force only and has priority over email
  readonly userId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional() // Forgetting and Common
  readonly emailVerificationCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional() // Common if and only if do not require email verification code
  readonly oldPassword?: string;

  @ApiProperty()
  @IsString()
  @Length(6, 32)
  readonly newPassword: string;
}
