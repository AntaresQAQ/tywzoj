import { ApiProperty } from "@nestjs/swagger";

import { ProblemTagDetailDto, ProblemTagTypeDetailDto } from "@/problem/dto/problem-tag.dto";

export class GetProblemTagListResponseDto {
  @ApiProperty()
  tagsDetails: ProblemTagDetailDto[];

  @ApiProperty()
  tagTypeDetails: ProblemTagTypeDetailDto[];
}
