export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
