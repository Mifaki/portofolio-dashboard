import { rolesService } from './service'
import type { ApiResponse } from '~/types/api'
import type { Role } from '~/types/roles'

export const useRoles = () => {
  const config = useRuntimeConfig()

  const { data, status } = useAsyncData<ApiResponse<Role[]>>(
    'roles',
    () => rolesService.getAll(config.public.apiBase)
  )

  const roles = computed<Role[]>(() => {
    const d = data.value?.data
    if (!d) return []
    return Array.isArray(d) ? d : d.items
  })

  return { roles, isLoading: computed(() => status.value === 'pending') }
}
