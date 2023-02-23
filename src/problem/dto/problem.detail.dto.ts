import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

import { transformBoolean } from "@/common/transformers";
import { ProblemDetailDto } from "@/problem/dto/problem.dto";
import { ProblemTagTypeDetailDto } from "@/problem/dto/problem-tag.dto";

export class GetProblemDetailRequestParamDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  displayId: number;
}

export class GetProblemDetailRequestQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(transformBoolean)
  queryTags?: boolean;
}

export class GetProblemDetailResponseDto {
  @ApiProperty()
  problemDetail: ProblemDetailDto;

  @ApiPropertyOptional()
  tagTypeDetails?: ProblemTagTypeDetailDto[];
}
