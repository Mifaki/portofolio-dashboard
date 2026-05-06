<script setup lang="ts">
import type { PaginationMeta } from '~/types/api'
import type { Sortable as SortableType, SortableStopEvent } from '@shopify/draggable'

const props = withDefaults(
  defineProps<{
    data?: unknown[]
    columns: unknown[]
    loading?: boolean
    meta?: PaginationMeta | null
    page?: number
    limit?: number
    rowLabel?: string
    draggable?: boolean
    canDrag?: boolean
  }>(),
  { data: () => [] }
)

const emit = defineEmits<{
  'update:page': [value: number]
  dragged: [payload: { item: unknown; fromIndex: number; toIndex: number }]
}>()

const items = defineModel<unknown[]>('items', { default: () => [] })

const currentPage = computed({
  get: () => props.page ?? 1,
  set: (val: number) => emit('update:page', val),
})

const tbodyRef = ref<HTMLElement | null>(null)
let sortableInstance: SortableType | null = null

async function initSortable() {
  if (!tbodyRef.value) return
  sortableInstance?.destroy()
  sortableInstance = null
  if (!props.canDrag) return

  const { Sortable } = await import('@shopify/draggable')
  sortableInstance = new Sortable(tbodyRef.value, {
    draggable: 'tr[data-sortable-item]',
    handle: '[data-drag-handle]',
    mirror: { constrainDimensions: true, appendTo: 'body' },
    distance: 4,
  })

  sortableInstance.on('sortable:stop', (evt: SortableStopEvent) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) return
    const arr = [...items.value]
    const [moved] = arr.splice(oldIndex, 1)
    arr.splice(newIndex, 0, moved)
    items.value = arr
    emit('dragged', { item: moved, fromIndex: oldIndex, toIndex: newIndex })
  })
}

onMounted(() => {
  if (props.draggable) initSortable()
})

onUnmounted(() => sortableInstance?.destroy())

watch(
  () => props.canDrag,
  async () => {
    if (!props.draggable) return
    await nextTick()
    initSortable()
  }
)

watch(
  () => items.value.length,
  async () => {
    if (!props.draggable) return
    await nextTick()
    initSortable()
  }
)

const CellRenderer = (cellProps: { col: any; row: any }) => {
  const { col, row } = cellProps
  if (col.cell) {
    const result = col.cell({ row: { original: row } })
    return typeof result === 'string'
      ? h('span', { class: 'text-sm text-default' }, result)
      : result
  }
  const val = col.accessorKey ? (row as any)[col.accessorKey] : ''
  return h('span', { class: 'text-sm text-default' }, String(val ?? ''))
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="$slots.headers" class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <slot name="headers" />
    </div>

    <template v-if="draggable">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-default border-b">
              <th class="w-8 px-3 py-3" />
              <th
                v-for="col in columns as any[]"
                :key="col.id ?? col.accessorKey"
                class="text-muted px-3 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                :style="col.size ? { width: `${col.size}px` } : {}"
              >
                {{ typeof col.header === 'string' ? col.header : '' }}
              </th>
            </tr>
          </thead>
          <tbody ref="tbodyRef">
            <tr v-if="loading && !items.length">
              <td :colspan="(columns as any[]).length + 1" class="px-4 py-12 text-center">
                <UIcon name="i-lucide-loader" class="text-muted size-6 animate-spin" />
              </td>
            </tr>
            <template v-else-if="!items.length">
              <tr>
                <td :colspan="(columns as any[]).length + 1" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <UIcon name="i-lucide-inbox" class="text-muted size-8" />
                    <p class="text-muted text-sm">
                      No {{ rowLabel ? `${rowLabel}s` : 'results' }} found
                    </p>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="(row, rowIdx) in items"
                :key="(row as any).id ?? rowIdx"
                data-sortable-item
                class="group border-default hover:bg-elevated/50 border-b transition-colors"
              >
                <td class="w-8 px-3 py-3.5">
                  <div
                    data-drag-handle
                    class="text-muted flex cursor-grab items-center justify-center opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
                    :class="canDrag ? '' : 'pointer-events-none'"
                  >
                    <UIcon name="i-lucide-grip-vertical" class="size-4" />
                  </div>
                </td>
                <td
                  v-for="col in columns as any[]"
                  :key="col.id ?? col.accessorKey"
                  class="px-3 py-3.5"
                >
                  <component :is="CellRenderer" :col="col" :row="row" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>

    <UTable
      v-else
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

<style>
.draggable-mirror {
  opacity: 0.9;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.2);
  background: var(--color-background);
  border-radius: 0.25rem;
  display: table;
  width: 100%;
}

.draggable--original {
  opacity: 0.3 !important;
}
</style>
