// user auth
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}
