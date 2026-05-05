import type { ApiResponse } from '~/types/api'
import type { Role } from '~/types/roles'

export const useRolesService = () => {
  const { api } = useApi()

  return {
    getAll: () => api<ApiResponse<Role[]>>('/roles'),
  }
}
