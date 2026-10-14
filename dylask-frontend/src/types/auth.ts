export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  defaultMode: 'standard' | 'developer';
  isVerified: boolean;
  isAiEnabled: boolean;
  aiTrialRemaining: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  email: string;
  fullName: string;
  requiresVerification: boolean;
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
