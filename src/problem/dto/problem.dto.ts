import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ProblemTagDetailDto } from "@/problem/dto/problem-tag.dto";
import {
  CE_ProblemLevel,
  E_ProblemScope,
  E_ProblemType,
  IProblemAtomicEntityWithExtra,
  IProblemBaseEntityWithExtra,
  IProblemEntityWithExtra,
} from "@/problem/problem.types";
import { UserAtomicDetailDto } from "@/user/dto/user.dto";

import { ProblemSampleBaseDetailDto } from "./problem-sample.dto";

export abstract class ProblemAtomicDetailDto implements IProblemAtomicEntityWithExtra {
  @ApiProperty()
  id: number;

  @ApiProperty()
  displayId: number;

  @ApiProperty()
  title: string;
}

export abstract class ProblemBaseDetailDto extends ProblemAtomicDetailDto implements IProblemBaseEntityWithExtra {
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

  @ApiPropertyOptional()
  tags?: ProblemTagDetailDto[];
}

export abstract class ProblemDetailDto extends ProblemBaseDetailDto implements IProblemEntityWithExtra {
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

  @ApiProperty()
  owner: UserAtomicDetailDto;

  @ApiProperty()
  samples: ProblemSampleBaseDetailDto[];
}
