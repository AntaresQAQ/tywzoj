import { ApiProperty } from "@nestjs/swagger";

import { IProblemTagEntity, IProblemTagTypeEntity } from "@/problem/problem-tag.types";

export class ProblemTagDetailDto implements IProblemTagEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  typeId: number;

  @ApiProperty()
  order: number;
}

export class ProblemTagTypeDetailDto implements IProblemTagTypeEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  order: number;
}
