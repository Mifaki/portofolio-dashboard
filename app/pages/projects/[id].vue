<script setup lang="ts">
import { useProjectsService } from '~/composables/projects/service'
import { useAuth } from '~/composables/auth/useAuth'
import type { Project, CreateProjectPayload } from '~/types/projects'

const route = useRoute()
const service = useProjectsService()
const { isAuthenticated } = useAuth()
const toast = useToast()

const { data, status, error, refresh } = useAsyncData(`project-${route.params.id}`, () =>
  service.getOne(route.params.id as string)
)

const isPageLoading = computed(() => status.value === 'pending')

const project = computed<Project | null>(() => {
  const d = data.value?.data
  if (!d || !('id' in d)) return null
  return d as Project
})

const isSaving = ref(false)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

async function handleSubmit(payload: CreateProjectPayload) {
  isSaving.value = true
  try {
    await service.update(route.params.id as string, payload)
    toast.add({ title: 'Project updated', color: 'success', icon: 'i-lucide-check-circle' })
    refresh()
  } catch (e: any) {
    toast.add({
      title: 'Failed to update project',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete() {
  isDeleting.value = true
  try {
    await service.remove(route.params.id as string)
    toast.add({ title: 'Project deleted', color: 'success', icon: 'i-lucide-check-circle' })
    await navigateTo('/projects')
  } catch (e: any) {
    toast.add({
      title: 'Failed to delete project',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="project-detail">
    <template #header>
      <UDashboardNavbar :title="project?.title ?? 'Project'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            label="Back"
            to="/projects"
          />
          <UButton
            v-if="isAuthenticated"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            label="Delete"
            :disabled="isPageLoading || isDeleting"
            @click="isDeleteOpen = true"
          />
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <SharedErrorState v-if="error" message="Failed to load project." @retry="() => refresh()" />

      <div v-else-if="isPageLoading" class="flex items-center justify-center py-24">
        <UIcon name="i-lucide-loader" class="text-muted size-8 animate-spin" />
      </div>

      <div v-else-if="project" class="p-6 lg:p-8">
        <ProjectsProjectForm
          :initial-data="project"
          :loading="isSaving"
          @submit="handleSubmit"
          @cancel="navigateTo('/projects')"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="isDeleteOpen" title="Delete Project">
    <template #body>
      <p class="text-muted text-sm">
        Are you sure you want to delete
        <span class="text-highlighted font-semibold">{{ project?.title }}</span
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
