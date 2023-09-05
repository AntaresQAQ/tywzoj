import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from "class-validator";

import { CE_Language, languages } from "@/common/locales";
import { HttpPatch } from "@/common/types";
import { CE_Theme, IUserPreferenceEntity, IUserPreferenceEntityWithExtra } from "@/user/user-preference.types";

export abstract class UserPreferenceDto implements IUserPreferenceEntityWithExtra {
    @ApiProperty()
    userPreferTheme: CE_Theme;

    @ApiProperty()
    userPreferLanguage: CE_Language;

    @ApiProperty()
    showTagsOnProblemList: boolean;

    @ApiProperty()
    showTagsOnProblemDetail: boolean;
}

export class UserPreferenceRequestParamDto {
    @ApiProperty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    readonly id: number;
}

export abstract class PatchUserPreferenceRequestBodyDto implements HttpPatch<IUserPreferenceEntity> {
    @ApiPropertyOptional()
    @IsIn([CE_Theme.Light, CE_Theme.Dark, CE_Theme.HighContrast])
    @IsOptional()
    readonly userPreferTheme?: CE_Theme;

    @ApiPropertyOptional()
    @IsIn(languages)
    @IsOptional()
    readonly userPreferLanguage?: CE_Language;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    readonly showTagsOnProblemList?: boolean;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    readonly showTagsOnProblemDetail?: boolean;
}

export abstract class UserPreferenceResponseDto extends UserPreferenceDto {}
