import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

import { booleanTransformerFactory } from "@/common/transformers";
import { UserAtomicDetailDto } from "@/user/dto/user.dto";

export abstract class UserSearchRequestQueryDto {
    @ApiProperty()
    @IsString()
    readonly key: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    @Transform(booleanTransformerFactory())
    readonly strict?: boolean;
}

export abstract class GetUserSearchResponseDto {
    @ApiProperty()
    users: UserAtomicDetailDto[];
}
