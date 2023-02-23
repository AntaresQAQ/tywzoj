import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, Min } from "class-validator";

import { UserDetailDto } from "@/user/dto/user.dto";

export class GetUserListRequestQueryDto {
  @ApiProperty({ enum: ["acceptedProblemCount", "rating", "id"] })
  @IsIn(["acceptedProblemCount", "rating", "id"])
  readonly sortBy: "acceptedProblemCount" | "rating" | "id";

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly skipCount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly takeCount: number;
}

export class GetUserListResponseDto {
  @ApiProperty({ type: UserDetailDto })
  users: UserDetailDto[];

  @ApiProperty()
  count: number;
}
