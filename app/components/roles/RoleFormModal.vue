<script setup lang="ts">
import { roleSchema } from '~/composables/roles/schemas'
import { useRolesService } from '~/composables/roles/service'
import type { Role } from '~/types/roles'

const props = defineProps<{
  mode: 'create' | 'edit'
  role?: Role | null
}>()

const emit = defineEmits<{ saved: [] }>()

const open = defineModel<boolean>('open', { default: false })
const service = useRolesService()
const toast = useToast()
const isLoading = ref(false)

const formState = reactive({ name: '', title: '' })

function populateForm() {
  if (props.mode === 'edit' && props.role) {
    formState.name = props.role.name
    formState.title = props.role.title ?? ''
  } else {
    formState.name = ''
    formState.title = ''
  }
}

watch([open, () => props.role], ([isOpen]) => {
  if (isOpen) populateForm()
})

async function onSubmit(event: { data: any }) {
  isLoading.value = true
  try {
    const { name, title } = event.data
    const body = { name, ...(title ? { title } : {}) }

    if (props.mode === 'create') {
      await service.create(body)
      toast.add({ title: 'Role created', color: 'success', icon: 'i-lucide-check-circle' })
    } else {
      await service.update(props.role!.id, body)
      toast.add({ title: 'Role updated', color: 'success', icon: 'i-lucide-check-circle' })
    }
    open.value = false
    emit('saved')
  } catch (e: any) {
    toast.add({
      title: props.mode === 'create' ? 'Failed to create role' : 'Failed to update role',
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
  <UModal v-model:open="open" :title="mode === 'create' ? 'Create Role' : 'Edit Role'">
    <template #body>
      <UForm :schema="roleSchema" :state="formState" class="space-y-4" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput
            v-model="formState.name"
            placeholder="admin"
            autocomplete="off"
            class="w-full"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField label="Title" name="title" hint="Human-readable label">
          <UInput
            v-model="formState.title"
            placeholder="Administrator"
            autocomplete="off"
            class="w-full"
            :disabled="isLoading"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" label="Cancel" :disabled="isLoading" @click="open = false" />
          <UButton type="submit" :label="mode === 'create' ? 'Create' : 'Save'" :loading="isLoading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
