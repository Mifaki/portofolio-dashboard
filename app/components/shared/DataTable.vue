<script setup lang="ts">
import type { PaginationMeta } from '~/types/api'

const props = defineProps<{
  data: unknown[]
  columns: unknown[]
  loading?: boolean
  meta?: PaginationMeta | null
  page?: number
  limit?: number
  rowLabel?: string
}>()

const emit = defineEmits<{ 'update:page': [value: number] }>()

const currentPage = computed({
  get: () => props.page ?? 1,
  set: (val: number) => emit('update:page', val)
})
</script>

<template>
  <div>
    <UTable :data="data" :columns="(columns as any)" :loading="loading" class="w-full" />

    <div v-if="meta" class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">
        {{ meta.total }} {{ rowLabel ? (meta.total === 1 ? rowLabel : `${rowLabel}s`) : 'results' }}
      </p>
      <UPagination v-model:page="currentPage" :total="meta.total" :items-per-page="limit ?? 10" />
    </div>
  </div>
</template>
