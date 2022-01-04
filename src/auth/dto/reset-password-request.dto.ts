import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

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
  @IsOptional()
  readonly email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly emailVerificationCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly oldPassword?: string;

  @ApiProperty()
  @IsString()
  @Length(6, 32)
  readonly password: string;
}
