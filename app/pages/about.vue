<script setup lang="ts">
import { z } from 'zod'
import { useAboutService } from '~/composables/about/service'
import { useAuth } from '~/composables/auth/useAuth'
import type { About, CreateAboutPayload } from '~/types/about'

const service = useAboutService()
const { isAuthenticated } = useAuth()
const toast = useToast()

const { data, status, error, refresh } = useAsyncData('about', () =>
  service.get().catch((e: any) => {
    if (e?.response?.status === 404) return null
    throw e
  })
)

const isLoading = computed(() => status.value === 'pending')
const about = computed<About | null>(() => {
  if (!data.value) return null
  const d = data.value.data
  if (!d || typeof d !== 'object' || !('id' in d)) return null
  return d as About
})

const showCreateForm = ref(false)
const isCreating = ref(false)

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  instagram: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
})
const createState = reactive({ name: '', instagram: '', github: '', linkedin: '' })

async function handleCreate() {
  isCreating.value = true
  try {
    const payload: CreateAboutPayload = {
      name: createState.name,
      instagram: createState.instagram || undefined,
      github: createState.github || undefined,
      linkedin: createState.linkedin || undefined,
    }
    await service.create(payload)
    toast.add({ title: 'About created', color: 'success', icon: 'i-lucide-check-circle' })
    showCreateForm.value = false
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Failed to create About',
      description: e.data?.message ?? 'Something went wrong.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  } finally {
    isCreating.value = false
  }
}

const isDeleteOpen = ref(false)
const isDeleting = ref(false)

async function confirmDelete() {
  isDeleting.value = true
  try {
    await service.remove()
    toast.add({ title: 'About deleted', color: 'success', icon: 'i-lucide-check-circle' })
    isDeleteOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Failed to delete About',
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
  <UDashboardPanel id="about">
    <template #header>
      <UDashboardNavbar title="About">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            v-if="about && isAuthenticated"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            label="Delete"
            :disabled="isDeleting"
            @click="isDeleteOpen = true"
          />
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="isLoading" class="flex items-center justify-center py-24">
        <UIcon name="i-lucide-loader" class="text-muted size-8 animate-spin" />
      </div>

      <SharedErrorState
        v-else-if="error"
        message="Failed to load About."
        @retry="() => refresh()"
      />

      <template v-else-if="!about">
        <div
          v-if="!showCreateForm"
          class="flex flex-col items-center justify-center gap-4 py-24 text-center"
        >
          <div class="bg-elevated flex size-14 items-center justify-center rounded-full">
            <UIcon name="i-lucide-user-circle" class="text-muted size-7" />
          </div>
          <div>
            <p class="text-default font-semibold">No About record found</p>
            <p class="text-muted mt-1 text-sm">Create your About profile to get started.</p>
          </div>
          <UButton
            icon="i-lucide-plus"
            label="Create About"
            :disabled="!isAuthenticated"
            @click="showCreateForm = true"
          />
        </div>

        <div v-else class="mx-auto max-w-xl p-6 lg:p-8">
          <div class="mb-6 flex items-center gap-3">
            <span class="text-muted text-xs font-semibold tracking-widest uppercase"
              >New About</span
            >
            <div class="bg-default h-px flex-1" />
          </div>
          <UForm
            :schema="createSchema"
            :state="createState"
            class="space-y-4"
            @submit="handleCreate"
          >
            <UFormField label="Name" name="name" required>
              <UInput
                v-model="createState.name"
                placeholder="Your name"
                class="w-full"
                :disabled="isCreating"
              />
            </UFormField>
            <UFormField label="Instagram URL" name="instagram">
              <UInput
                v-model="createState.instagram"
                placeholder="https://instagram.com/..."
                class="w-full"
                :disabled="isCreating"
              />
            </UFormField>
            <UFormField label="GitHub URL" name="github">
              <UInput
                v-model="createState.github"
                placeholder="https://github.com/..."
                class="w-full"
                :disabled="isCreating"
              />
            </UFormField>
            <UFormField label="LinkedIn URL" name="linkedin">
              <UInput
                v-model="createState.linkedin"
                placeholder="https://linkedin.com/in/..."
                class="w-full"
                :disabled="isCreating"
              />
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton
                color="neutral"
                variant="ghost"
                label="Cancel"
                :disabled="isCreating"
                @click="showCreateForm = false"
              />
              <UButton type="submit" label="Create About" :loading="isCreating" />
            </div>
          </UForm>
        </div>
      </template>

      <AboutForm v-else :about="about" @refresh="refresh" />
    </template>
  </UDashboardPanel>

  <UModal v-model:open="isDeleteOpen" title="Delete About">
    <template #body>
      <p class="text-muted text-sm">
        Are you sure you want to delete the About record for
        <span class="text-highlighted font-semibold">{{ about?.name }}</span
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
