import { ApiProperty } from '@nestjs/swagger';

import { ProblemMetaDto } from '@/problem/dto/problem-meta.dto';

export enum GetProblemListResponseError {
  NOT_LOGGED = 'NOT_LOGGED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TAKE_TOO_MANY = 'TAKE_TOO_MANY',
}

export class GetProblemListResponseDto {
  @ApiProperty()
  error?: GetProblemListResponseError;

  @ApiProperty()
  problemMetas?: ProblemMetaDto[];

  @ApiProperty()
  count?: number;
}
