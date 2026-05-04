<script setup lang="ts">
import { createUserColumns } from '~/composables/users/columns'
import { useUsers } from '~/composables/users/useUsers'

const { users, meta, isLoading, error, refresh, q, page, limit, roleId } = useUsers()
const columns = createUserColumns()

const searchInput = ref(q.value)
watch(searchInput, useDebounceFn((val: string) => { q.value = val }, 400))
watch(q, (val) => { if (searchInput.value !== val) searchInput.value = val })
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
      <SharedErrorState
        v-if="error"
        message="Failed to load users."
        @retry="() => refresh()"
      />
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
        <template #filters>
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            placeholder="Search users..."
            :loading="isLoading"
            class="w-48 lg:w-64"
          />
          <SharedRoleSelect v-model="roleId" />
        </template>
      </SharedDataTable>
    </template>
  </UDashboardPanel>
</template>
