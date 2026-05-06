import type { Ref } from 'vue'

export function useSearchInput(q: Ref<string>) {
  const searchInput = ref(q.value)
  watch(
    searchInput,
    useDebounceFn((val: string) => {
      q.value = val
    }, 400)
  )
  watch(q, (val) => {
    if (searchInput.value !== val) searchInput.value = val
  })
  return { searchInput }
}
