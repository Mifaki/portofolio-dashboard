import type { ApiResponse } from '~/types/api'
import type { About, CreateAboutPayload, UpdateAboutPayload } from '~/types/about'

export const useAboutService = () => {
  const { api } = useApi()
  return {
    get: () => api<ApiResponse<About>>('/about'),

    create: (body: CreateAboutPayload) => api<ApiResponse<any>>('/about', { method: 'POST', body }),

    update: (body: UpdateAboutPayload) =>
      api<ApiResponse<About>>('/about', { method: 'PUT', body }),

    remove: () => api<ApiResponse<{ id: string; name: string }>>('/about', { method: 'DELETE' }),
  }
}
