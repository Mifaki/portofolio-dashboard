import type { ApiResponse } from '~/types/api'
import type { User, CreateUserPayload, UpdateUserPayload } from '~/types/users'

export interface UsersQuery {
  q?: string
  roleId?: string
  page?: number
  limit?: number
}

export const useUsersService = () => {
  const { api } = useApi()

  return {
    getAll: (query: UsersQuery = {}) => api<ApiResponse<User[]>>('/users', { query }),

    create: (body: CreateUserPayload) => api<ApiResponse<User>>('/users', { method: 'POST', body }),

    update: (id: string, body: UpdateUserPayload) =>
      api<ApiResponse<User>>(`/users/${id}`, { method: 'PUT', body }),

    remove: (id: string) =>
      api<ApiResponse<{ id: string; email: string; username: string }>>(`/users/${id}`, {
        method: 'DELETE',
      }),
  }
}
