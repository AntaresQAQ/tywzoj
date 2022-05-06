import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsDto {
  @ApiProperty()
  acceptedProblemCounter: number;

  @ApiProperty()
  submissionCounter: number;

  @ApiProperty()
  rating: number;

  // TODO: fix after query the submissions
  // It will be an object
  @ApiProperty()
  submissions?: string;
}
