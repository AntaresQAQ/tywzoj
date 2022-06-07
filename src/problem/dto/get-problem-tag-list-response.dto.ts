import { ApiProperty } from '@nestjs/swagger';

import { ProblemTagMetaDto } from '@/problem/dto/problem-tag-meta.dto';

export enum GetProblemTagListError {
  NOT_LOGGED = 'NOT_LOGGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export class GetProblemTagListResponseDto {
  @ApiProperty()
  error?: GetProblemTagListError;

  @ApiProperty()
  algorithmTagMetas?: ProblemTagMetaDto[];

  @ApiProperty()
  datetimeTagMetas?: ProblemTagMetaDto[];

  @ApiProperty()
  originTagMetas?: ProblemTagMetaDto[];

  @ApiProperty()
  otherTagsMetas?: ProblemTagMetaDto[];
}
