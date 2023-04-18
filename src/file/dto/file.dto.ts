import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { IFileUploadRequest } from "@/file/file.types";

export abstract class FileUploadRequestDto implements IFileUploadRequest {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  postUrl: string;

  @ApiPropertyOptional()
  formData: unknown;
}
