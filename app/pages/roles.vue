<script setup lang="ts">
import { createRoleColumns } from '~/composables/roles/columns'
import { useRolesPage } from '~/composables/roles/useRolesPage'
import { useRolesService } from '~/composables/roles/service'
import { useAuth } from '~/composables/auth/useAuth'
import type { Role } from '~/types/roles'

const { roles, meta, isLoading, error, refresh, q, page, limit } = useRolesPage()
const service = useRolesService()
const { isAuthenticated } = useAuth()
const toast = useToast()

const { searchInput } = useSearchInput(q)

const isFormOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedRole = ref<Role | null>(null)

function openCreate() {
  formMode.value = 'create'
  selectedRole.value = null
  isFormOpen.value = true
}

function openEdit(role: Role) {
  formMode.value = 'edit'
  selectedRole.value = role
  isFormOpen.value = true
}

const isDeleteOpen = ref(false)
const deletingRole = ref<Role | null>(null)
const isDeleting = ref(false)

function openDelete(role: Role) {
  deletingRole.value = role
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingRole.value) return
  isDeleting.value = true
  try {
    await service.remove(deletingRole.value.id)
    toast.add({ title: 'Role deleted', color: 'success', icon: 'i-lucide-check-circle' })
    isDeleteOpen.value = false
    deletingRole.value = null
    refresh()
  } catch (e: any) {
    toast.add({
      title: 'Failed to delete role',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isDeleting.value = false
  }
}

const columns = createRoleColumns({ onEdit: openEdit, onDelete: openDelete, isAuthenticated })
</script>

<template>
  <UDashboardPanel id="roles">
    <template #header>
      <UDashboardNavbar title="Roles">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <SharedErrorState v-if="error" message="Failed to load roles." @retry="() => refresh()" />
      <SharedDataTable
        v-else
        :data="roles"
        :columns="columns"
        :meta="meta"
        :loading="isLoading"
        v-model:page="page"
        :limit="limit"
        row-label="role"
      >
        <template #headers>
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            placeholder="Search roles..."
            :loading="isLoading"
            class="w-48 lg:w-64"
          />
          <UButton
            icon="i-lucide-plus"
            label="New Role"
            :disabled="!isAuthenticated"
            @click="openCreate"
          />
        </template>
      </SharedDataTable>
    </template>
  </UDashboardPanel>

  <RolesRoleFormModal
    v-model:open="isFormOpen"
    :mode="formMode"
    :role="selectedRole"
    @saved="refresh()"
  />

  <UModal v-model:open="isDeleteOpen" title="Delete Role">
    <template #body>
      <p class="text-muted text-sm">
        Are you sure you want to delete
        <span class="text-highlighted font-semibold">{{ deletingRole?.name }}</span
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
