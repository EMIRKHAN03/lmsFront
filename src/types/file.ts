// types/file.ts
import type { HttpStatus } from './common';

export interface AwsResponse {
  fileName: string;
  urlFile: string;
}

export interface SimpleResponse {
  httpStatus: HttpStatus;
  message: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  originalName: string;
  size: number;
  uploadDate: string;
  url: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}