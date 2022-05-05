import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetUserInfoRequestDto {
  @ApiProperty()
  @IsNumber()
  readonly id: number;
}
