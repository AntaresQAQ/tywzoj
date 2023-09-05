import { ApiProperty } from "@nestjs/swagger";

import { GetProblemDetailRequestParamDto } from "./problem.detail.dto";
import { ProblemFileDetailDto } from "./problem-file.dto";

export abstract class GetProblemFilesRequestParamDto extends GetProblemDetailRequestParamDto {}

export abstract class GetProblemFilesResponseDto {
    @ApiProperty()
    files: ProblemFileDetailDto[];
}
