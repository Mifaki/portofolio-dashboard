import { h } from 'vue'
import { UBadge } from '#components'
import type { User } from '~/types/users'

type CellCtx = { row: { original: User } }

export const createUserColumns = () => {
  return [
    {
      accessorKey: 'username',
      header: 'Username'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }: CellCtx) => h(UBadge,
        { color: 'primary', variant: 'subtle', size: 'sm' },
        () => row.original.role?.name ?? '—'
      )
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }: CellCtx) => row.original.lastLoginAt
        ? new Date(row.original.lastLoginAt).toLocaleDateString()
        : '—'
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }: CellCtx) => new Date(row.original.createdAt).toLocaleDateString()
    }
  ]
}
