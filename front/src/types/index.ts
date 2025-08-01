// src/types/index.ts

// Tipos para Usuario y Autenticación
export interface UserInfo {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  streetNumber: string;
  phone: string;
  role: string;
  token: string;
  address?: string;
  refreshToken?: string;
  dni?: string;  
  alias?: string;
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
  [key: string]: any;
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