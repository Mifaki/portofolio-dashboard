import { usersService } from './service'
import type { ApiResponse, PaginationMeta } from '~/types/api'
import type { User } from '~/types/users'

export const useUsers = () => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const router = useRouter()
  const { q, page, limit } = useQueryFilter({ page: 1, limit: 10 })

  const roleId = computed({
    get: () => (route.query.roleId as string) ?? '',
    set: (val: string) => {
      const next: Record<string, string> = {}
      const merged = { ...route.query, roleId: val || undefined, page: '1' }
      for (const [key, v] of Object.entries(merged)) {
        if (v !== undefined && v !== '') next[key] = String(v)
      }
      router.replace({ query: next })
    }
  })

  const { data, status, error, refresh } = useAsyncData<ApiResponse<User[]>>(
    'users',
    () => usersService.getAll(config.public.apiBase, {
      q: q.value || undefined,
      roleId: roleId.value || undefined,
      page: page.value,
      limit: limit.value
    }),
    { watch: [q, page, limit, roleId] }
  )

  const users = computed<User[]>(() => {
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

  return { users, meta, isLoading, error, refresh, q, page, limit, roleId }
}
