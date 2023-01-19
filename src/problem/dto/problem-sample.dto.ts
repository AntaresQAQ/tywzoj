import { ApiProperty } from "@nestjs/swagger";

import { IProblemSampleEntity } from "@/problem/problem-sample.types";

export class ProblemSampleBaseDetailDto implements IProblemSampleEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  input: string;

  @ApiProperty()
  output: string;

  @ApiProperty()
  explanation: string;
}
