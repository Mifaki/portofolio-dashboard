export interface UserRole {
  id: string
  name: string
}

export interface User {
  id: string
  email: string
  username: string
  role: UserRole | null
  lastLoginAt: string | null
  createdAt: string
}

export interface CreateUserPayload {
  email: string
  username: string
  password: string
  roleId?: string
}

export interface UpdateUserPayload {
  email?: string
  username?: string
  password?: string
  roleId?: string
}
