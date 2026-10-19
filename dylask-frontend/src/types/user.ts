export type AppMode = 'standard' | 'developer';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  defaultMode: AppMode;
  isAiEnabled: boolean;
  aiTrialCount: number;
  aiTrialLimit: number;
  aiTrialResetAt: string;
  createdAt: string;
}

export interface UpdateModeRequest {
  mode: AppMode;
}

export interface UpdateModeResponse {
  defaultMode: AppMode;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
