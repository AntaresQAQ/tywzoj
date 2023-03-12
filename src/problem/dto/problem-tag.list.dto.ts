import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

import { booleanTransformerFactory } from "@/common/transformers";

import { ProblemTagDetailDto, ProblemTagTypeDetailDto } from "./problem-tag.dto";

export class GetProblemTagListRequestQueryDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  problemId: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(booleanTransformerFactory())
  queryType?: boolean;
}

export class GetProblemTagListResponseDto {
  @ApiProperty()
  tags: ProblemTagDetailDto[];
}

export class GetProblemTagTypeListRequestQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(booleanTransformerFactory())
  queryTags?: boolean;
}

export class GetProblemTagTypeListResponseDto {
  @ApiProperty()
  tagTypes: ProblemTagTypeDetailDto[];
}
