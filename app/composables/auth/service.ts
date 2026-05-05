import type { AuthUser } from '~/types/auth'

interface AuthResponse<T> {
  status: string
  message: string
  data: T
}

export const authService = {
  login: (baseURL: string, identifier: string, password: string) =>
    $fetch<AuthResponse<{ email: string }>>('/auth/login', {
      method: 'POST',
      baseURL,
      body: { identifier, password },
    }),

  verifyOtp: (baseURL: string, email: string, code: string) =>
    $fetch<AuthResponse<{ token: string; refreshToken: string; user: AuthUser }>>(
      '/auth/otp/verify',
      {
        method: 'POST',
        baseURL,
        body: { email, code },
      }
    ),

  requestOtp: (baseURL: string, email: string) =>
    $fetch<AuthResponse<null>>('/auth/otp/request', {
      method: 'POST',
      baseURL,
      body: { email },
    }),

  logout: (baseURL: string, token: string) =>
    $fetch<AuthResponse<null>>('/auth/logout', {
      method: 'POST',
      baseURL,
      headers: { Authorization: `Bearer ${token}` },
    }),

  refresh: (baseURL: string, refreshToken: string) =>
    $fetch<AuthResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
      method: 'POST',
      baseURL,
      body: { refreshToken },
    }),
}
