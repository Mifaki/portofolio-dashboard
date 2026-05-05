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
  set: (val: number) => emit('update:page', val),
})
</script>

<template>
  <div class="flex flex-col">
    <div v-if="$slots.headers" class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <slot name="headers" />
    </div>

    <UTable
      :data="data"
      :columns="columns as any"
      :loading="loading"
      sticky
      class="w-full flex-1"
      :ui="{
        tr: 'hover:bg-elevated/50 transition-colors',
        td: 'py-3.5',
        th: 'py-3 text-xs font-semibold uppercase tracking-wider text-muted',
      }"
    >
      <template #empty>
        <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <UIcon name="i-lucide-inbox" class="text-muted size-8" />
          <p class="text-muted text-sm">No {{ rowLabel ? `${rowLabel}s` : 'results' }} found</p>
        </div>
      </template>
    </UTable>

    <div v-if="meta" class="flex items-center justify-between px-4 py-3">
      <p class="text-muted text-sm">
        <span class="text-highlighted font-medium">{{ meta.total }}</span>
        {{ rowLabel ? (meta.total === 1 ? rowLabel : `${rowLabel}s`) : 'results' }}
      </p>
      <UPagination v-model:page="currentPage" :total="meta.total" :items-per-page="limit ?? 10" />
    </div>
  </div>
</template>
