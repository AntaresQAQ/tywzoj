import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class GetProblemListRequestDto {
  @ApiProperty({ enum: ['id', 'title', 'submissionCount', 'acceptedSubmissionCount'] })
  @IsIn(['id', 'title', 'submissionCount', 'acceptedSubmissionCount'])
  readonly sortBy: 'id' | 'title' | 'submissionCount' | 'acceptedSubmissionCount';

  @ApiProperty({ enum: ['ASC', 'DESC'] })
  @IsIn(['ASC', 'DESC'])
  readonly order: 'ASC' | 'DESC';

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly skipCount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly takeCount: number;

  @ApiProperty({ nullable: true })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  readonly tagIds: number[];
}
