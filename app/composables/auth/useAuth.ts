import { authService } from './service'
import type { AuthUser } from '~/types/auth'

export const useAuth = () => {
  const config = useRuntimeConfig()

  const token = useCookie<string | null>('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7
  })

  const refreshToken = useCookie<string | null>('auth-refresh-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30
  })

  const user = useCookie<AuthUser | null>('auth-user', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7
  })

  const isAuthenticated = computed(() => !!token.value)

  const login = async (identifier: string, password: string) => {
    const res = await authService.login(config.public.apiBase, identifier, password)
    return res.data.email
  }

  const verifyOtp = async (email: string, code: string) => {
    const res = await authService.verifyOtp(config.public.apiBase, email, code)
    token.value = res.data.token
    refreshToken.value = res.data.refreshToken
    user.value = res.data.user
  }

  const requestOtp = async (email: string) => {
    await authService.requestOtp(config.public.apiBase, email)
  }

  const logout = async () => {
    if (token.value) {
      try { await authService.logout(config.public.apiBase, token.value) } catch {}
    }
    token.value = null
    refreshToken.value = null
    user.value = null
    await navigateTo('/login')
  }

  return { token, user, isAuthenticated, login, verifyOtp, requestOtp, logout }
}
