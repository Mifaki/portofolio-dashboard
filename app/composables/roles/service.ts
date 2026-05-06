import type { ApiResponse } from '~/types/api'
import type { Role, CreateRolePayload, UpdateRolePayload } from '~/types/roles'

export interface RolesQuery {
  q?: string
  page?: number
  limit?: number
}

export const useRolesService = () => {
  const { api } = useApi()

  return {
    getAll: (query: RolesQuery = {}) => api<ApiResponse<Role[]>>('/roles', { query }),

    create: (body: CreateRolePayload) => api<ApiResponse<Role>>('/roles', { method: 'POST', body }),

    update: (id: string, body: UpdateRolePayload) =>
      api<ApiResponse<Role>>(`/roles/${id}`, { method: 'PUT', body }),

    remove: (id: string) =>
      api<ApiResponse<{ id: string; name: string }>>(`/roles/${id}`, { method: 'DELETE' }),
  }
}
