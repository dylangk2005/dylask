# Hướng Dẫn Xây Dựng API Client Chuẩn (React 19 / TypeScript)

Tài liệu này cung cấp module gọi API chuẩn cho `dylask-frontend`, tích hợp tự động JWT Bearer Token, kiểm soát kiểu dữ liệu và xử lý lỗi đồng nhất theo [api-specs.md](file:///d:/dylann/my-apps/dylask-web/docs/specs/api-specs.md).

---

## 1. Định Nghĩa Kiểu Dữ Liệu API Chung (`src/types/api.ts`)

```typescript
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  errorCode?: string;
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
  constructor(
    public code: number,
    public errorCode: string | undefined,
    message: string,
    public errors?: FieldErrorDTO[] | null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## 2. Base Fetch Client (`src/api/client.ts`)

```typescript
import { ApiResponse, ApiError } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) searchParams.append(key, String(val));
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  const token = localStorage.getItem('access_token');
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    ...restOptions,
    headers: defaultHeaders,
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new ApiError(
      json.code || response.status,
      json.errorCode,
      json.message || 'Đã có lỗi xảy ra',
      json.errors
    );
  }

  return json.data as T;
}

// Helper methods tiện lợi:
export const api = {
  get: <T>(url: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(url, { method: 'GET', params }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};
```

---

## 3. Mẫu API Module Nghiệp Vụ (`src/api/taskApi.ts`)

```typescript
import { api } from '@/api/client';
import { PageResponse } from '@/types/api';
import { TaskItem, CreateTaskDTO, UpdateTaskDTO } from '@/types/task';

export const taskApi = {
  getTasks: (status?: string, page = 0, size = 20) =>
    api.get<PageResponse<TaskItem>>('/tasks', { status, page, size }),

  getTaskById: (id: number) =>
    api.get<TaskItem>(`/tasks/${id}`),

  createTask: (payload: CreateTaskDTO) =>
    api.post<TaskItem>('/tasks', payload),

  updateTask: (id: number, payload: UpdateTaskDTO) =>
    api.put<TaskItem>(`/tasks/${id}`, payload),

  deleteTask: (id: number) =>
    api.delete<void>(`/tasks/${id}`),
};
```
