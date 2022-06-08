import { ApiProperty } from '@nestjs/swagger';

import { ProblemTagMetaDto } from '.';

export class ProblemMetaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  submissionCount: number;

  @ApiProperty()
  acceptedSubmissionCount: number;

  @ApiProperty({ nullable: true })
  tags?: ProblemTagMetaDto[];
}
