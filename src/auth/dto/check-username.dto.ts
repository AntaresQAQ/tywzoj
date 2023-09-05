import { ApiProperty } from "@nestjs/swagger";

import { IsUsername } from "@/common/validators";

export abstract class GetCheckUsernameRequestQueryDto {
    @ApiProperty()
    @IsUsername()
    readonly username: string;
}

export abstract class GetCheckUsernameResponseDto {
    @ApiProperty()
    available: boolean;
}
