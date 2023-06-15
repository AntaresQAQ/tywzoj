import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

import { booleanTransformerFactory } from "@/common/transformers";

import { GetProblemDetailRequestParamDto } from "./problem.detail.dto";
import { ProblemTagDetailDto, ProblemTagTypeDetailDto } from "./problem-tag.dto";

export class GetProblemTagsRequestParamDto extends GetProblemDetailRequestParamDto {}

export class GetProblemTagsRequestQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(booleanTransformerFactory())
  queryType?: boolean;
}

export class GetProblemTagsResponseDto {
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
