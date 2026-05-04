export interface QueryFilterDefaults {
  page?: number
  limit?: number
}

export const useQueryFilter = (defaults: QueryFilterDefaults = {}) => {
  const route = useRoute()
  const router = useRouter()

  const defaultPage = defaults.page ?? 1
  const defaultLimit = defaults.limit ?? 10

  const update = (patch: Record<string, string | number | undefined>) => {
    const next: Record<string, string> = {}
    const merged = { ...route.query, ...patch }
    for (const [key, val] of Object.entries(merged)) {
      if (val !== undefined && val !== '' && val !== null) {
        next[key] = String(val)
      }
    }
    router.replace({ query: next })
  }

  onMounted(() => {
    if (!route.query.page || !route.query.limit) {
      update({
        page: route.query.page ? Number(route.query.page) : defaultPage,
        limit: route.query.limit ? Number(route.query.limit) : defaultLimit
      })
    }
  })

  const q = computed({
    get: () => (route.query.q as string) ?? '',
    set: (val: string) => update({ q: val || undefined, page: 1 })
  })

  const page = computed({
    get: () => Number(route.query.page) || defaultPage,
    set: (val: number) => update({ page: val })
  })

  const limit = computed({
    get: () => Number(route.query.limit) || defaultLimit,
    set: (val: number) => update({ limit: val, page: 1 })
  })

  return { q, page, limit }
}
