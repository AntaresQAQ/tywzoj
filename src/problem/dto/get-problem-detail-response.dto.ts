import { ApiProperty } from '@nestjs/swagger';

import { ProblemContentDto, ProblemMetaDto } from '.';

export enum GetProblemDetailResponseError {
  NOT_LOGGED = 'NOT_LOGGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NO_SUCH_PROBLEM = 'NO_SUCH_PROBLEM',
}

export class GetProblemDetailResponseDto {
  @ApiProperty()
  error?: GetProblemDetailResponseError;

  @ApiProperty()
  problemMeta?: ProblemMetaDto;

  @ApiProperty()
  problemContent?: ProblemContentDto;
}
