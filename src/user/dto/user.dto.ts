import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { CE_UserLevel } from "@/common/user-level";
import { IUserAtomicEntityWithExtra, IUserBaseEntityWithExtra, IUserEntityWithExtra } from "@/user/user.types";

export abstract class UserAtomicDetailDto implements IUserAtomicEntityWithExtra {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty({ nullable: true })
    avatar: string;
}

export abstract class UserBaseDetailDto extends UserAtomicDetailDto implements IUserBaseEntityWithExtra {
    @ApiProperty()
    email: string;

    @ApiPropertyOptional()
    information?: string;

    @ApiProperty()
    level: CE_UserLevel;

    @ApiPropertyOptional()
    nickname?: string;
}

export abstract class UserDetailDto extends UserBaseDetailDto implements IUserEntityWithExtra {
    @ApiProperty()
    acceptedProblemCount: number;

    @ApiProperty()
    submissionCount: number;

    @ApiProperty()
    rating: number;

    @ApiProperty()
    registrationTime: Date;
}
