import type { ApiResponse } from '~/types/api'
import type { User } from '~/types/users'

export interface UsersQuery {
  q?: string
  page?: number
  limit?: number
}

export const usersService = {
  getAll: (baseURL: string, query: UsersQuery = {}) =>
    $fetch<ApiResponse<User[]>>('/users', { baseURL, query })
}
