<script setup lang="ts">
import { z } from 'zod'
import type { AboutTechStack, TechStackInput } from '~/types/about'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  techStack?: AboutTechStack
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [payload: TechStackInput & { position: number }]
}>()

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  iconUrl: z.string().url('Must be a valid URL'),
  percentage: z.coerce.number().int().min(0, 'Min 0').max(100, 'Max 100'),
})

const state = reactive({ name: '', iconUrl: '', percentage: 0 })
const toast = useToast()

watch(
  () => props.open,
  (val) => {
    if (!val) return
    if (props.mode === 'edit' && props.techStack) {
      state.name = props.techStack.name
      state.iconUrl = props.techStack.iconUrl
      state.percentage = props.techStack.percentage
    } else {
      state.name = ''
      state.iconUrl = ''
      state.percentage = 0
    }
  },
  { immediate: true }
)

function onSubmit() {
  emit('save', {
    name: state.name,
    iconUrl: state.iconUrl,
    percentage: state.percentage,
    position: props.techStack?.position ?? 0,
  })
}
</script>

<template>
  <UModal
    :open="open"
    :title="mode === 'create' ? 'Add Tech Stack' : 'Edit Tech Stack'"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="e.g. TypeScript"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <UFormField label="Icon" name="iconUrl" required>
          <SharedFileUploader
            v-model="state.iconUrl"
            :disabled="loading"
            @error="
              (msg) =>
                toast.add({
                  title: 'Upload error',
                  description: msg,
                  color: 'error',
                  icon: 'i-lucide-circle-alert',
                })
            "
          />
        </UFormField>

        <UFormField label="Percentage" name="percentage" required>
          <UInput
            v-model.number="state.percentage"
            type="number"
            min="0"
            max="100"
            placeholder="0–100"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            :disabled="loading"
            @click="emit('update:open', false)"
          />
          <UButton type="submit" :label="mode === 'create' ? 'Add' : 'Save'" :loading="loading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
