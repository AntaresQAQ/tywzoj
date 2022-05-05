import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsDto {
  @ApiProperty()
  acceptedProblemCounter: number;

  @ApiProperty()
  submissionCounter: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  submissions: unknown;
}
