export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {}

export interface StudentLoginPayload {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string | null;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  permissions: Permission[];
}

export interface UserProfile {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserSettings {
  id: number;
  theme: string;
  language: string;
  marketing_emails_enabled: boolean;
  push_notifications_enabled: boolean;
  timezone?: string | null;
  teaching_tools?: string[] | null;
  custom_tools?: string[] | null;
  teaching_style?: string | null;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  token_balance: number;
  tokens_used: number;
  created_at: string;
  roles: Role[];
  profile?: UserProfile | null;
  settings?: UserSettings | null;
}

export interface UserRoleUpdate {
  role_ids: number[];
}

export interface UserProfileUpdatePayload {
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserSettingsUpdatePayload {
  theme?: string | null;
  language?: string | null;
  marketing_emails_enabled?: boolean;
  push_notifications_enabled?: boolean;
  timezone?: string | null;
  teaching_tools?: string[] | null;
  custom_tools?: string[] | null;
  teaching_style?: string | null;
}

export interface AuthResponse extends TokenResponse {
  user: User;
}

/** Login response — tokens are sent via httpOnly cookies, only user data in body. */
export interface LoginResponse {
  user: User;
}

export interface AuthMessage {
  message: string;
}

export interface EmailVerificationConfirmPayload {
  email: string;
  token: string;
}

export interface EmailVerificationResendPayload {
  email: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  email: string;
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}
