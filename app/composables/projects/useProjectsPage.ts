import { useProjectsService } from './service'
import type { ApiResponse, PaginationMeta } from '~/types/api'
import type { Project } from '~/types/projects'

export const useProjectsPage = () => {
  const service = useProjectsService()
  const { q, page, limit } = useQueryFilter({ page: 1, limit: 10 })

  const { data, status, error, refresh } = useAsyncData<ApiResponse<Project[]>>(
    'projects-page',
    () =>
      service.getAll({
        q: q.value || undefined,
        page: page.value,
        limit: limit.value,
      }),
    { watch: [q, page, limit] }
  )

  const projects = computed<Project[]>(() => {
    const d = data.value?.data
    if (!d) return []
    return Array.isArray(d) ? d : (d.items as Project[])
  })

  const meta = computed<PaginationMeta | null>(() => {
    const d = data.value?.data
    if (!d || Array.isArray(d)) return null
    return d.meta
  })

  const isLoading = computed(() => status.value === 'pending')

  return { projects, meta, isLoading, error, refresh, q, page, limit }
}
