let pendingRefresh: Promise<void> | null = null

export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth-token')
  const refreshToken = useCookie<string | null>('auth-refresh-token')
  const user = useCookie<any>('auth-user')

  async function refreshSession() {
    if (pendingRefresh) return pendingRefresh

    pendingRefresh = $fetch<{ data: { token: string; refreshToken: string } }>('/auth/refresh', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: { refreshToken: refreshToken.value },
    })
      .then((res) => {
        token.value = res.data.token
        refreshToken.value = res.data.refreshToken
      })
      .finally(() => {
        pendingRefresh = null
      })

    return pendingRefresh
  }

  async function clearSession() {
    token.value = null
    refreshToken.value = null
    user.value = null
    await navigateTo('/login')
  }

  async function api<T>(url: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const buildHeaders = (): Record<string, string> => ({
      ...(options?.headers as Record<string, string> | undefined),
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    })

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBase,
        ...options,
        headers: buildHeaders(),
      })
    } catch (error: any) {
      const status = error?.response?.status

      if (status === 401 && refreshToken.value) {
        try {
          await refreshSession()
        } catch {
          await clearSession()
          throw error
        }

        return $fetch<T>(url, {
          baseURL: config.public.apiBase,
          ...options,
          headers: buildHeaders(),
        })
      }

      throw error
    }
  }

  return { api }
}
