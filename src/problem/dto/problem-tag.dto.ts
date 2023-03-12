import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { IProblemTagBaseEntityWithExtra, IProblemTagEntityWithExtra } from "../problem-tag.types";
import { IProblemTagTypeBaseEntityWithExtra, IProblemTagTypeEntityWithExtra } from "../problem-tag-type.types";

export abstract class ProblemTagBaseDetailDto implements IProblemTagBaseEntityWithExtra {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  typeId: number;

  @ApiProperty()
  order: number;
}

export abstract class ProblemTagTypeBaseDetailDto implements IProblemTagTypeBaseEntityWithExtra {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  order: number;

  @ApiPropertyOptional()
  tags?: ProblemTagDetailDto[];
}

export abstract class ProblemTagDetailDto extends ProblemTagBaseDetailDto implements IProblemTagEntityWithExtra {
  @ApiPropertyOptional()
  type?: ProblemTagTypeBaseDetailDto;
}

export abstract class ProblemTagTypeDetailDto
  extends ProblemTagTypeBaseDetailDto
  implements IProblemTagTypeEntityWithExtra
{
  @ApiPropertyOptional()
  tags?: ProblemTagBaseDetailDto[];
}
