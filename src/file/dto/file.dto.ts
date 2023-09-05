import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { IFileEntity, IFileUploadRequest } from "@/file/file.types";

export abstract class FileDto implements IFileEntity {
    @ApiProperty()
    uuid: string;

    @ApiProperty()
    size: number;

    @ApiProperty()
    uploadTime: Date;
}

export abstract class FileUploadRequestDto implements IFileUploadRequest {
    @ApiProperty()
    uuid: string;

    @ApiProperty()
    postUrl: string;

    @ApiPropertyOptional()
    formData: unknown;
}
