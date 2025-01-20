// src/types/index.ts

// Tipos para Usuario y Autenticación
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  token?: string;
  refreshToken?: string;
  role?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;  // Ajustado según tu componente Login
  password: string;
}

export interface LoginResponse {
  userInfo: UserInfo;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  userInfo: UserInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: any;
}

export interface RootState {
  auth: AuthState;
}

export interface LoginFormError {
  usernameOrEmail: boolean;
  password: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: UserInfo;
  token: string;
}