export interface AuthUser {
  id: string
  username: string
  email: string
  role: string | null
  lastLoginAt: string | null
  createdAt: string
}

export interface Session {
  token: string
  refreshToken: string
  user: AuthUser
}
