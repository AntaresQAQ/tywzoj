import { ApiProperty } from '@nestjs/swagger';

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
}
