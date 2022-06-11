import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetProblemDetailRequestDto {
  @ApiProperty()
  @IsInt()
  readonly displayId: number;
}
