import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSessionInfoRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly token?: string;
}
