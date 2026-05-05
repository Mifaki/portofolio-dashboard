import { useRolesService } from './service'
import type { ApiResponse, PaginationMeta } from '~/types/api'
import type { Role } from '~/types/roles'

export const useRolesPage = () => {
  const service = useRolesService()
  const { q, page, limit } = useQueryFilter({ page: 1, limit: 10 })

  const { data, status, error, refresh } = useAsyncData<ApiResponse<Role[]>>(
    'roles-page',
    () =>
      service.getAll({
        q: q.value || undefined,
        page: page.value,
        limit: limit.value,
      }),
    { watch: [q, page, limit] }
  )

  const roles = computed<Role[]>(() => {
    const d = data.value?.data
    if (!d) return []
    return Array.isArray(d) ? d : d.items
  })

  const meta = computed<PaginationMeta | null>(() => {
    const d = data.value?.data
    if (!d || Array.isArray(d)) return null
    return d.meta
  })

  const isLoading = computed(() => status.value === 'pending')

  return { roles, meta, isLoading, error, refresh, q, page, limit }
}
