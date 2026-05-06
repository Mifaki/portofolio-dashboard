import { h, type Ref } from 'vue'
import { UButton } from '#components'
import type { Project } from '~/types/projects'

type CellCtx = { row: { original: Project } }

interface ColumnActions {
  onView: (project: Project) => void
  onDelete: (project: Project) => void
  isAuthenticated: Ref<boolean>
}

export const createProjectColumns = (actions?: ColumnActions) => {
  const cols: any[] = [
    {
      id: 'position',
      header: '#',
      size: 60,
      cell: ({ row }: CellCtx) =>
        h(
          'span',
          {
            class:
              'bg-elevated text-muted flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums',
          },
          String(row.original.position)
        ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: CellCtx) =>
        h('span', { class: 'text-sm font-medium text-default' }, row.original.title),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: CellCtx) => h('span', { class: 'text-sm text-muted' }, row.original.category),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: CellCtx) => h('span', { class: 'text-sm text-muted' }, row.original.type),
    },
    {
      accessorKey: 'year',
      header: 'Year',
      size: 80,
      cell: ({ row }: CellCtx) =>
        h('span', { class: 'text-sm text-muted tabular-nums' }, row.original.year),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: CellCtx) =>
        h(
          'span',
          { class: 'text-sm text-muted' },
          new Date(row.original.createdAt).toLocaleDateString()
        ),
    },
  ]

  if (actions) {
    cols.push({
      id: 'actions',
      header: '',
      cell: ({ row }: CellCtx) =>
        h('div', { class: 'flex justify-end gap-1' }, [
          h(UButton, {
            icon: 'i-lucide-pencil',
            color: 'neutral',
            variant: 'ghost',
            size: 'xs',
            disabled: !actions.isAuthenticated.value,
            onClick: (e: Event) => {
              e.stopPropagation()
              actions.onView(row.original)
            },
          }),
          h(UButton, {
            icon: 'i-lucide-trash-2',
            color: 'error',
            variant: 'ghost',
            size: 'xs',
            disabled: !actions.isAuthenticated.value,
            onClick: (e: Event) => {
              e.stopPropagation()
              actions.onDelete(row.original)
            },
          }),
        ]),
    })
  }

  return cols
}
