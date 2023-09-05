import { ApiProperty } from "@nestjs/swagger";

import { IProblemJudgeInfoEntity } from "../problem-judge-info.types";

export abstract class ProblemJudgeInfoDto implements IProblemJudgeInfoEntity {
    @ApiProperty()
    problemId: number;

    @ApiProperty()
    timeLimit: number;

    @ApiProperty()
    memoryLimit: number;

    @ApiProperty()
    fileIO: boolean;

    @ApiProperty()
    inputFile: string;

    @ApiProperty()
    outputFile: string;
}
