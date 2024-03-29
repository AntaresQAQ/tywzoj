import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

import { PreferenceConfig } from "@/config/config.schema";
import { UserBaseDetailDto } from "@/user/dto/user.dto";
import { UserPreferenceDto } from "@/user/dto/user-preference.dto";

import { ServerVersionDto } from "./server-version.dto";

export abstract class GetSessionInfoRequestQueryDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    readonly token?: string;
}

export abstract class GetSessionInfoResponseDto {
    @ApiProperty()
    userBaseDetail?: UserBaseDetailDto;

    @ApiProperty()
    userPreference?: UserPreferenceDto;

    @ApiProperty()
    serverVersion: ServerVersionDto;

    @ApiProperty()
    preference: PreferenceConfig;

    @ApiProperty()
    unixTimestamp: number;
}
