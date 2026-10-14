/**
 * Chuẩn phản hồi ApiResponse từ Spring Boot Backend
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  errorCode?: string | null;
  message: string;
  data: T | null;
  errors?: FieldErrorDTO[] | null;
  timestamp: string;
}

export interface FieldErrorDTO {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export class ApiError extends Error {
  code: number;
  errorCode?: string | null;
  errors?: FieldErrorDTO[] | null;

  constructor(message: string, code: number, errorCode?: string | null, errors?: FieldErrorDTO[] | null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
