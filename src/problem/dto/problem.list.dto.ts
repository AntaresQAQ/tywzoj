import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

import { arrayTransformerFactory, booleanTransformerFactory } from "@/common/transformers";

import { ProblemBaseDetailDto } from "./problem.dto";

export abstract class GetProblemListRequestQueryDto {
  @ApiProperty({ enum: ["id", "title", "submissionCount", "acceptedSubmissionCount"] })
  @IsIn(["id", "title", "submissionCount", "acceptedSubmissionCount"])
  readonly sortBy: "id" | "title" | "submissionCount" | "acceptedSubmissionCount";

  @ApiProperty({ enum: ["ASC", "DESC"] })
  @IsIn(["ASC", "DESC"])
  readonly order: "ASC" | "DESC";

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly skipCount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly takeCount: number;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @Length(0, 80)
  @IsOptional()
  readonly keyword?: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(booleanTransformerFactory())
  readonly keywordMatchesId: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt({ each: true })
  @Transform(arrayTransformerFactory({ transformItem: value => Number(value) }))
  readonly tagIds?: number[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(booleanTransformerFactory())
  readonly queryTags?: boolean;
}

export abstract class GetProblemListResponseDto {
  @ApiProperty()
  problems: ProblemBaseDetailDto[];

  @ApiProperty()
  count: number;
}
