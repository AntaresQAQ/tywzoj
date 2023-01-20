import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

import { IsIntString, MinNumberString } from "@/common/validators";
import { UserDetailDto } from "@/user/dto/user.dto";

export class GetUserListRequestQueryDto {
  @ApiProperty({ enum: ["acceptedProblemCount", "rating", "id"] })
  @IsIn(["acceptedProblemCount", "rating", "id"])
  readonly sortBy: "acceptedProblemCount" | "rating" | "id";

  @ApiProperty()
  @IsIntString()
  @MinNumberString(0)
  readonly skipCount: number;

  @ApiProperty()
  @IsIntString()
  @MinNumberString(1)
  readonly takeCount: number;
}

export class GetUserListResponseDto {
  @ApiProperty({ type: UserDetailDto })
  users: UserDetailDto[];

  @ApiProperty()
  count: number;
}
