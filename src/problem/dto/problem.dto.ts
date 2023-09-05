import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { UserAtomicDetailDto } from "@/user/dto/user.dto";

import {
    CE_ProblemLevel,
    E_ProblemScope,
    E_ProblemType,
    IProblemAtomicEntityWithExtra,
    IProblemBaseEntityWithExtra,
    IProblemEntityWithExtra,
} from "../problem.types";
import { ProblemJudgeInfoDto } from "./problem-judge-info.dto";
import { ProblemSampleBaseDetailDto } from "./problem-sample.dto";
import { ProblemTagDetailDto } from "./problem-tag.dto";

export abstract class ProblemAtomicDetailDto implements IProblemAtomicEntityWithExtra {
    @ApiProperty()
    id: number;

    @ApiProperty({ nullable: true })
    displayId: number;

    @ApiProperty()
    title: string;
}

export abstract class ProblemBaseDetailDto extends ProblemAtomicDetailDto implements IProblemBaseEntityWithExtra {
    @ApiPropertyOptional({ nullable: true })
    subtitle: string;

    @ApiProperty()
    isPublic: boolean;

    @ApiProperty()
    publicTime: Date;

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
    @ApiProperty({ nullable: true })
    description: string;

    @ApiProperty({ nullable: true })
    inputFormat: string;

    @ApiProperty({ nullable: true })
    outputFormat: string;

    @ApiProperty({ nullable: true })
    limitAndHint: string;

    @ApiProperty({ enum: E_ProblemType })
    type: E_ProblemType;

    @ApiProperty()
    level: CE_ProblemLevel;

    @ApiProperty({ nullable: true })
    owner: UserAtomicDetailDto;

    @ApiProperty({ isArray: true })
    samples: ProblemSampleBaseDetailDto[];

    @ApiProperty()
    judgeInfo: ProblemJudgeInfoDto;
}
