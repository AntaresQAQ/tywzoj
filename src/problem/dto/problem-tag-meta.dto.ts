import { ApiProperty } from '@nestjs/swagger';

import { ProblemTagType } from '@/problem/problem-tag.entity';

export class ProblemTagMetaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ProblemTagType })
  type: ProblemTagType;

  @ApiProperty()
  order: number;
}
