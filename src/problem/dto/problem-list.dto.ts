import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

import { ProblemBaseDetailDto } from "@/problem/dto/problem.dto";

export class GetProblemListRequestQueryDto {
  @ApiProperty({ enum: ["id", "title", "submissionCount", "acceptedSubmissionCount"] })
  @IsIn(["id", "title", "submissionCount", "acceptedSubmissionCount"])
  readonly sortBy: "id" | "title" | "submissionCount" | "acceptedSubmissionCount";

  @ApiProperty({ enum: ["ASC", "DESC"] })
  @IsIn(["ASC", "DESC"])
  readonly order: "ASC" | "DESC";

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly skipCount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
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

  @ApiProperty()
  @IsBoolean()
  readonly queryTags: boolean;
}

export class GetProblemListResponseDto {
  @ApiProperty()
  problems: ProblemBaseDetailDto[];

  @ApiProperty()
  count: number;
}
