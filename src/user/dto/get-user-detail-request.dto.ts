import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetUserDetailRequestDto {
  @ApiProperty()
  @IsNumber()
  readonly id: number;
}
