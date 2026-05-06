<script setup lang="ts">
import { createProjectColumns } from '~/composables/projects/columns'
import { useProjectsPage } from '~/composables/projects/useProjectsPage'
import { useProjectsService } from '~/composables/projects/service'
import { useAuth } from '~/composables/auth/useAuth'
import type { Project } from '~/types/projects'

const { projects, meta, isLoading, error, refresh, q, page, limit } = useProjectsPage()
const service = useProjectsService()
const { isAuthenticated } = useAuth()
const toast = useToast()

const { searchInput } = useSearchInput(q)

const displayedProjects = ref<Project[]>([])

type DraggedMove = { projectId: string; originalPosition: number; newPosition: number }
const draggedMoves = ref<Map<string, DraggedMove>>(new Map())

const isDirty = computed(() => draggedMoves.value.size > 0)

watch(
  projects,
  (incoming) => {
    if (!isDirty.value) {
      displayedProjects.value = [...incoming]
    }
  },
  { immediate: true }
)

const canDrag = computed(() => !q.value && isAuthenticated.value)

function onProjectDragged({
  item,
  toIndex,
}: {
  item: unknown
  fromIndex: number
  toIndex: number
}) {
  const project = item as Project
  const existing = draggedMoves.value.get(project.id)
  const newMap = new Map(draggedMoves.value)
  newMap.set(project.id, {
    projectId: project.id,
    originalPosition: existing?.originalPosition ?? project.position,
    newPosition: toIndex,
  })
  draggedMoves.value = newMap
}

const isSavingPositions = ref(false)

function resetPositions() {
  displayedProjects.value = [...projects.value]
  draggedMoves.value = new Map()
}

async function savePositions() {
  isSavingPositions.value = true
  try {
    for (const move of draggedMoves.value.values()) {
      if (move.originalPosition !== move.newPosition) {
        await service.updatePosition(move)
      }
    }

    draggedMoves.value = new Map()
    toast.add({ title: 'Positions saved', color: 'success', icon: 'i-lucide-check-circle' })
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Failed to save positions',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isSavingPositions.value = false
  }
}

const isDeleteOpen = ref(false)
const deletingProject = ref<Project | null>(null)
const isDeleting = ref(false)

function openDelete(project: Project) {
  deletingProject.value = project
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingProject.value) return
  isDeleting.value = true
  try {
    await service.remove(deletingProject.value.id)
    toast.add({ title: 'Project deleted', color: 'success', icon: 'i-lucide-check-circle' })
    isDeleteOpen.value = false
    deletingProject.value = null
    refresh()
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

const columns = createProjectColumns({
  onView: (project) => navigateTo(`/projects/${project.id}`),
  onDelete: openDelete,
  isAuthenticated,
})
</script>

<template>
  <UDashboardPanel id="projects">
    <template #header>
      <UDashboardNavbar title="Projects">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <SharedErrorState v-if="error" message="Failed to load projects." @retry="() => refresh()" />

      <template v-else>
        <Transition name="banner">
          <div
            v-if="isDirty"
            class="border-warning/25 bg-warning/8 flex items-center gap-3 border-b px-4 py-2.5"
          >
            <UIcon name="i-lucide-move" class="text-warning size-4 shrink-0" />
            <p class="text-default flex-1 text-sm">
              Position changes pending — drag to reorder, then save.
            </p>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              label="Reset"
              :disabled="isSavingPositions"
              @click="resetPositions"
            />
            <UButton
              size="xs"
              label="Save Positions"
              icon="i-lucide-check"
              :loading="isSavingPositions"
              @click="savePositions"
            />
          </div>
        </Transition>

        <SharedDataTable
          v-model:items="displayedProjects"
          :columns="columns"
          :meta="meta"
          :loading="isLoading"
          v-model:page="page"
          :limit="limit"
          row-label="project"
          draggable
          :can-drag="canDrag"
          @dragged="onProjectDragged"
        >
          <template #headers>
            <UInput
              v-model="searchInput"
              icon="i-lucide-search"
              placeholder="Search projects..."
              :loading="isLoading"
              class="w-48 lg:w-64"
            />
            <div class="flex items-center gap-2">
              <p v-if="q && isAuthenticated" class="text-muted text-xs">
                <UIcon name="i-lucide-info" class="size-3" />
                Clear search to enable drag reorder
              </p>
              <UButton
                icon="i-lucide-plus"
                label="New Project"
                :disabled="!isAuthenticated"
                to="/projects/new"
              />
            </div>
          </template>
        </SharedDataTable>
      </template>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="isDeleteOpen" title="Delete Project">
    <template #body>
      <p class="text-muted text-sm">
        Are you sure you want to delete
        <span class="text-highlighted font-semibold">{{ deletingProject?.title }}</span
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

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 200ms ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
