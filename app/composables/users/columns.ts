import { h, type Ref } from 'vue'
import { UBadge, UButton } from '#components'
import type { User } from '~/types/users'

type CellCtx = { row: { original: User } }

interface ColumnActions {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  isAuthenticated: Ref<boolean>
}

export const createUserColumns = (actions?: ColumnActions) => {
  const cols: any[] = [
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'email', header: 'Email' },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }: CellCtx) =>
        h(
          UBadge,
          { color: 'primary', variant: 'subtle', size: 'sm' },
          () => row.original.role?.name ?? '—'
        ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }: CellCtx) =>
        row.original.lastLoginAt ? new Date(row.original.lastLoginAt).toLocaleDateString() : '—',
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }: CellCtx) => new Date(row.original.createdAt).toLocaleDateString(),
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
