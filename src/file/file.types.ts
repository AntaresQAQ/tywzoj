export interface IFileEntity {
  uuid: string;
  size: number;
  uploadTime: Date;
}

export interface IFileUploadRequest {
  uuid: string;
  postUrl: string;
  formData: unknown;
}
