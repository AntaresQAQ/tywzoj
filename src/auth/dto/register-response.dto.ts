import { ApiProperty } from '@nestjs/swagger';

import { UserMetaDto } from '@/user/dto';

export enum RegisterResponseError {
  ALREADY_LOGGED = 'ALREADY_LOGGED',
  DUPLICATE_USERNAME = 'DUPLICATE_USERNAME',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  INVALID_EMAIL_VERIFICATION_CODE = 'INVALID_EMAIL_VERIFICATION_CODE',
}

export class RegisterResponseDto {
  @ApiProperty({ enum: RegisterResponseError })
  error?: RegisterResponseError;

  @ApiProperty()
  token?: string;

  @ApiProperty()
  userMeta?: UserMetaDto;
}
