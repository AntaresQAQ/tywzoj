import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

import { booleanTransformerFactory } from "@/common/transformers";

import { ProblemDetailDto } from "./problem.dto";

export abstract class GetProblemDetailRequestParamDto {
    @ApiProperty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    id: number;
}

export abstract class GetProblemDetailRequestQueryDto {
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    @Transform(booleanTransformerFactory())
    queryTags?: boolean;
}

export abstract class GetProblemDetailResponseDto extends ProblemDetailDto {}

export abstract class GetProblemDetailByDisplayIdRequestParamDto {
    @ApiProperty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    displayId: number;
}

export abstract class GetProblemDetailByDisplayIdRequestQueryDto extends GetProblemDetailRequestQueryDto {}

export abstract class GetProblemDetailByDisplayIdResponseDto extends GetProblemDetailResponseDto {}
