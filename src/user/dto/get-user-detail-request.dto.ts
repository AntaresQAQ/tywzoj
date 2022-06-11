import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetUserDetailRequestDto {
  @ApiProperty()
  @IsInt()
  readonly id: number;
}
