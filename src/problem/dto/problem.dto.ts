import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import {
  CE_ProblemLevel,
  E_ProblemScope,
  E_ProblemType,
  IProblemBaseEntity,
  IProblemEntityWithExtra,
} from "@/problem/problem.types";
import { UserBaseDetailDto } from "@/user/dto/user.dto";

import { ProblemSampleBaseDetailDto } from "./problem-sample.dto";

export class ProblemBaseDetailDto implements IProblemBaseEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  displayId: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subtitle: string;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ enum: E_ProblemScope })
  scope: E_ProblemScope;

  @ApiProperty()
  submissionCount: number;

  @ApiProperty()
  acceptedSubmissionCount: number;
}

export class ProblemDetailDto extends ProblemBaseDetailDto implements IProblemEntityWithExtra {
  @ApiProperty()
  description: string;

  @ApiProperty()
  inputFormat: string;

  @ApiProperty()
  outputFormat: string;

  @ApiProperty()
  limitAndHint: string;

  @ApiProperty()
  type: E_ProblemType;

  @ApiProperty()
  level: CE_ProblemLevel;

  @ApiPropertyOptional()
  owner?: UserBaseDetailDto;

  @ApiPropertyOptional()
  samples?: ProblemSampleBaseDetailDto[];
}
