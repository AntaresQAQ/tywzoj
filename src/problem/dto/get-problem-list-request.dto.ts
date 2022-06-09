import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

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
  @IsString()
  @Length(0, 80)
  @IsOptional()
  readonly keyword?: string;

  @ApiProperty()
  @IsBoolean()
  readonly keywordMatchesId: boolean;

  @ApiProperty({ nullable: true })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  readonly tagIds?: number[];

  @ApiProperty()
  @IsBoolean()
  readonly showTags: boolean;
}
