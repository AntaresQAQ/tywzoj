import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber } from "class-validator";

import { ProblemDetailDto } from "@/problem/dto/problem.dto";
import { ProblemTagTypeDetailDto } from "@/problem/dto/problem-tag.dto";

export class GetProblemDetailRequestParamDto {
  @ApiProperty()
  @IsNumber()
  displayId: number;
}

export class GetProblemDetailRequestQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  queryTags?: boolean;
}

export class GetProblemDetailResponseDto {
  @ApiProperty()
  problemDetail: ProblemDetailDto;

  @ApiPropertyOptional()
  tagTypeDetails?: ProblemTagTypeDetailDto[];
}
