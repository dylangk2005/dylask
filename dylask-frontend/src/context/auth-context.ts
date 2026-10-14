import { createContext } from 'react';
import type { User, LoginRequest, RegisterRequest, RegisterResponse, VerifyEmailRequest } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
