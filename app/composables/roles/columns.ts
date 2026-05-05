import { h, type Ref } from 'vue'
import { UBadge, UButton } from '#components'
import type { Role } from '~/types/roles'

type CellCtx = { row: { original: Role } }

interface ColumnActions {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  isAuthenticated: Ref<boolean>
}

export const createRoleColumns = (actions?: ColumnActions) => {
  const cols: any[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'title', header: 'Title' },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: CellCtx) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }: CellCtx) => new Date(row.original.updatedAt).toLocaleDateString(),
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
              actions.onEdit(row.original)
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
