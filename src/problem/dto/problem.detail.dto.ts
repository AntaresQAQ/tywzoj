import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

import { IsIntString, MinNumberString } from "@/common/validators";
import { ProblemDetailDto } from "@/problem/dto/problem.dto";
import { ProblemTagTypeDetailDto } from "@/problem/dto/problem-tag.dto";

export class GetProblemDetailRequestParamDto {
  @ApiProperty()
  @IsIntString()
  @MinNumberString(0)
  displayId: number;
}

export class GetProblemDetailRequestQueryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  queryTags?: boolean;
}

export class GetProblemDetailResponseDto {
  @ApiProperty()
  problemDetail: ProblemDetailDto;

  @ApiPropertyOptional()
  tagTypeDetails?: ProblemTagTypeDetailDto[];
}
