<script setup lang="ts">
import { createUserSchema, editUserSchema } from '~/composables/users/schemas'
import { useUsersService } from '~/composables/users/service'
import type { User } from '~/types/users'

const props = defineProps<{
  mode: 'create' | 'edit'
  user?: User | null
}>()

const emit = defineEmits<{ saved: [] }>()

const open = defineModel<boolean>('open', { default: false })
const service = useUsersService()
const toast = useToast()
const isLoading = ref(false)

const schema = computed(() => (props.mode === 'create' ? createUserSchema : editUserSchema))

const formState = reactive({
  email: '',
  username: '',
  password: '',
  roleId: '',
})

function populateForm() {
  if (props.mode === 'edit' && props.user) {
    formState.email = props.user.email
    formState.username = props.user.username
    formState.password = ''
    formState.roleId = props.user.role?.id ?? ''
  } else {
    formState.email = ''
    formState.username = ''
    formState.password = ''
    formState.roleId = ''
  }
}

watch([open, () => props.user], ([isOpen]) => {
  if (isOpen) populateForm()
})

async function onSubmit(event: { data: any }) {
  isLoading.value = true
  try {
    const { email, username, password, roleId } = event.data
    if (props.mode === 'create') {
      await service.create({ email, username, password, ...(roleId ? { roleId } : {}) })
      toast.add({ title: 'User created', color: 'success', icon: 'i-lucide-check-circle' })
    } else {
      await service.update(props.user!.id, {
        email,
        username,
        ...(password ? { password } : {}),
        ...(roleId ? { roleId } : {}),
      })
      toast.add({ title: 'User updated', color: 'success', icon: 'i-lucide-check-circle' })
    }
    open.value = false
    emit('saved')
  } catch (e: any) {
    toast.add({
      title: props.mode === 'create' ? 'Failed to create user' : 'Failed to update user',
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
  <UModal v-model:open="open" :title="mode === 'create' ? 'Create User' : 'Edit User'">
    <template #body>
      <UForm :schema="schema" :state="formState" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="formState.email"
            placeholder="user@email.com"
            autocomplete="off"
            class="w-full"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField label="Username" name="username" required>
          <UInput
            v-model="formState.username"
            placeholder="username"
            autocomplete="off"
            class="w-full"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
          :hint="mode === 'edit' ? 'Leave blank to keep current' : undefined"
          :required="mode === 'create'"
        >
          <UInput
            v-model="formState.password"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField label="Role" name="roleId">
          <SharedRoleSelect v-model="formState.roleId" default-label="No Role" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            :disabled="isLoading"
            @click="open = false"
          />
          <UButton
            type="submit"
            :label="mode === 'create' ? 'Create' : 'Save'"
            :loading="isLoading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
