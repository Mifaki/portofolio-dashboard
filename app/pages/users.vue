<script setup lang="ts">
import { createUserColumns } from '~/composables/users/columns'
import { useUsers } from '~/composables/users/useUsers'
import { useUsersService } from '~/composables/users/service'
import { useAuth } from '~/composables/auth/useAuth'
import type { User } from '~/types/users'

const { users, meta, isLoading, error, refresh, q, page, limit, roleId } = useUsers()
const service = useUsersService()
const { isAuthenticated } = useAuth()
const toast = useToast()

const { searchInput } = useSearchInput(q)

const isFormOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedUser = ref<User | null>(null)

function openCreate() {
  formMode.value = 'create'
  selectedUser.value = null
  isFormOpen.value = true
}

function openEdit(user: User) {
  formMode.value = 'edit'
  selectedUser.value = user
  isFormOpen.value = true
}

const isDeleteOpen = ref(false)
const deletingUser = ref<User | null>(null)
const isDeleting = ref(false)

function openDelete(user: User) {
  deletingUser.value = user
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingUser.value) return
  isDeleting.value = true
  try {
    await service.remove(deletingUser.value.id)
    toast.add({ title: 'User deleted', color: 'success', icon: 'i-lucide-check-circle' })
    isDeleteOpen.value = false
    deletingUser.value = null
    refresh()
  } catch (e: any) {
    toast.add({
      title: 'Failed to delete user',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isDeleting.value = false
  }
}

const columns = createUserColumns({ onEdit: openEdit, onDelete: openDelete, isAuthenticated })
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <SharedErrorState v-if="error" message="Failed to load users." @retry="() => refresh()" />
      <SharedDataTable
        v-else
        :data="users"
        :columns="columns"
        :meta="meta"
        :loading="isLoading"
        v-model:page="page"
        :limit="limit"
        row-label="user"
      >
        <template #headers>
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            placeholder="Search users..."
            :loading="isLoading"
            class="w-48 lg:w-64"
          />
          <div class="flex items-center gap-2">
            <SharedRoleSelect v-model="roleId" />
            <UButton
              icon="i-lucide-plus"
              label="New User"
              :disabled="!isAuthenticated"
              @click="openCreate"
            />
          </div>
        </template>
      </SharedDataTable>
    </template>
  </UDashboardPanel>

  <UsersUserFormModal
    v-model:open="isFormOpen"
    :mode="formMode"
    :user="selectedUser"
    @saved="refresh()"
  />

  <UModal v-model:open="isDeleteOpen" title="Delete User">
    <template #body>
      <p class="text-muted text-sm">
        Are you sure you want to delete
        <span class="text-highlighted font-semibold">{{ deletingUser?.username }}</span
        >? This action cannot be undone.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          label="Cancel"
          :disabled="isDeleting"
          @click="isDeleteOpen = false"
        />
        <UButton color="error" label="Delete" :loading="isDeleting" @click="confirmDelete" />
      </div>
    </template>
  </UModal>
</template>
