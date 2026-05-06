<script setup lang="ts">
import { useProjectsService } from '~/composables/projects/service'
import type { CreateProjectPayload } from '~/types/projects'

const service = useProjectsService()
const toast = useToast()
const isLoading = ref(false)

async function handleSubmit(payload: CreateProjectPayload) {
  isLoading.value = true
  try {
    await service.create(payload)
    toast.add({ title: 'Project created', color: 'success', icon: 'i-lucide-check-circle' })
    await navigateTo('/projects')
  } catch (e: any) {
    toast.add({
      title: 'Failed to create project',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="project-new">
    <template #header>
      <UDashboardNavbar title="New Project">
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
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 lg:p-8">
        <ProjectsProjectForm
          :loading="isLoading"
          @submit="handleSubmit"
          @cancel="navigateTo('/projects')"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
