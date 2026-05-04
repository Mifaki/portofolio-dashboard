import type { ApiResponse } from '~/types/api'
import type { Role } from '~/types/roles'

export const rolesService = {
  getAll: (baseURL: string) =>
    $fetch<ApiResponse<Role[]>>('/roles', { baseURL })
}
