import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsString, IsUUID, MaxLength, Min } from "class-validator";

import { IsValidFilename } from "@/common/validators";
import { FileDto, FileUploadRequestDto } from "@/file/dto/file.dto";

import { E_ProblemFileType, IProblemFileEntityWithExtra } from "../problem-file.type";

export abstract class ProblemFileDetailDto implements IProblemFileEntityWithExtra {
  @ApiProperty()
  id: number;

  @ApiProperty()
  filename: string;

  @ApiProperty({ enum: E_ProblemFileType })
  type: E_ProblemFileType;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  file: FileDto;
}

export abstract class PostProblemFileUploadRequestRequestBodyDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly problemId: number;

  @ApiProperty()
  @IsValidFilename()
  @MaxLength(256)
  readonly filename: string;

  @ApiProperty({ enum: E_ProblemFileType })
  @IsEnum(E_ProblemFileType)
  readonly type: E_ProblemFileType;

  @ApiProperty()
  @IsInt()
  readonly size: number;
}

export abstract class PostProblemFileUploadRequestResponseDto {
  uploadRequest: FileUploadRequestDto;
  token: string;
}

export abstract class PostProblemFileUploadedReportRequestBodyDto {
  @ApiProperty()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsUUID()
  readonly uuid: string;
}

export abstract class PostProblemFileUploadedReportResponseDto extends ProblemFileDetailDto {}
