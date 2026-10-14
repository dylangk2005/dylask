import { ApiError, type ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        localStorage.removeItem('access_token');
        return null;
      }

      const json = await res.json();
      if (json.success && json.data?.accessToken) {
        const newToken: string = json.data.accessToken;
        localStorage.setItem('access_token', newToken);
        return newToken;
      }

      localStorage.removeItem('access_token');
      return null;
    } catch {
      localStorage.removeItem('access_token');
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  // Tự động làm mới access token nếu gặp lỗi 401 Unauthorized (trừ các endpoint xác thực)
  const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/refresh');
  if (response.status === 401 && !isAuthEndpoint && !options.skipAuthRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });
    }
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      response.statusText || 'Lỗi kết nối máy chủ',
      response.status,
      'NETWORK_ERROR'
    );
  }

  if (!response.ok || !json.success) {
    throw new ApiError(
      json.message || 'Yêu cầu không thành công',
      json.code || response.status,
      json.errorCode,
      json.errors
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
