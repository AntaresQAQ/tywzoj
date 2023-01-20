import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsString, Length } from "class-validator";

import { IsIntString, MinNumberString } from "@/common/validators";
import { ProblemBaseDetailDto } from "@/problem/dto/problem.dto";

export class GetProblemListRequestQueryDto {
  @ApiProperty({ enum: ["id", "title", "submissionCount", "acceptedSubmissionCount"] })
  @IsIn(["id", "title", "submissionCount", "acceptedSubmissionCount"])
  readonly sortBy: "id" | "title" | "submissionCount" | "acceptedSubmissionCount";

  @ApiProperty({ enum: ["ASC", "DESC"] })
  @IsIn(["ASC", "DESC"])
  readonly order: "ASC" | "DESC";

  @ApiProperty()
  @IsIntString()
  @MinNumberString(0)
  readonly skipCount: number;

  @ApiProperty()
  @IsIntString()
  @MinNumberString(1)
  readonly takeCount: number;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @Length(0, 80)
  @IsOptional()
  readonly keyword?: string;

  @ApiProperty()
  @IsBoolean()
  readonly keywordMatchesId: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  readonly tagIds?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  readonly queryTags?: boolean;
}

export class GetProblemListResponseDto {
  @ApiProperty()
  problems: ProblemBaseDetailDto[];

  @ApiProperty()
  count: number;
}
