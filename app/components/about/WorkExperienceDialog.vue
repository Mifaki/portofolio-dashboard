<script setup lang="ts">
import { z } from 'zod'
import type { WorkExperience, WorkExperienceInput } from '~/types/about'
import { MONTHS } from '~/constants'

const monthOptions = MONTHS.map((label, i) => ({ label, value: i + 1 }))

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  experience?: WorkExperience
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [payload: WorkExperienceInput]
}>()

const schema = z.object({
  company: z.string().min(1, 'Company is required').max(255),
  role: z.string().min(1, 'Role is required').max(255),
  description: z.string().optional(),
  location: z.string().max(255).optional(),
  startMonth: z.coerce.number().int().min(1).max(12),
  startYear: z.coerce.number().int().min(1900).max(2100),
  endMonth: z.coerce.number().int().min(1).max(12).optional(),
  endYear: z.coerce.number().int().min(1900).max(2100).optional(),
})

const state = reactive({
  company: '',
  role: '',
  description: '',
  location: '',
  startMonth: 1,
  startYear: new Date().getFullYear(),
  endMonth: undefined as number | undefined,
  endYear: undefined as number | undefined,
})

const isPresent = ref(false)

watch(
  () => props.open,
  (val) => {
    if (!val) return
    if (props.mode === 'edit' && props.experience) {
      const e = props.experience
      state.company = e.company
      state.role = e.role
      state.description = e.description ?? ''
      state.location = e.location ?? ''
      state.startMonth = e.startMonth
      state.startYear = e.startYear
      state.endMonth = e.endMonth ?? undefined
      state.endYear = e.endYear ?? undefined
      isPresent.value = e.endMonth == null
    } else {
      state.company = ''
      state.role = ''
      state.description = ''
      state.location = ''
      state.startMonth = 1
      state.startYear = new Date().getFullYear()
      state.endMonth = undefined
      state.endYear = undefined
      isPresent.value = false
    }
  },
  { immediate: true }
)

watch(isPresent, (val) => {
  if (val) {
    state.endMonth = undefined
    state.endYear = undefined
  }
})

function onSubmit() {
  const payload: WorkExperienceInput = {
    company: state.company,
    role: state.role,
    description: state.description || undefined,
    location: state.location || undefined,
    startMonth: state.startMonth,
    startYear: state.startYear,
    endMonth: isPresent.value ? undefined : state.endMonth,
    endYear: isPresent.value ? undefined : state.endYear,
    position: props.experience?.position ?? 0,
  }
  emit('save', payload)
}
</script>

<template>
  <UModal
    :open="open"
    :title="mode === 'create' ? 'Add Work Experience' : 'Edit Work Experience'"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Company" name="company" required class="col-span-2">
            <UInput
              v-model="state.company"
              placeholder="Acme Corp"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Role" name="role" required class="col-span-2">
            <UInput
              v-model="state.role"
              placeholder="Senior Engineer"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Location" name="location" class="col-span-2">
            <UInput
              v-model="state.location"
              placeholder="Remote / City, Country"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Start Month" name="startMonth" required>
            <USelect
              v-model="state.startMonth"
              :items="monthOptions"
              value-key="value"
              label-key="label"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Start Year" name="startYear" required>
            <UInput
              v-model.number="state.startYear"
              type="number"
              min="1900"
              max="2100"
              placeholder="2020"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>
        </div>

        <div class="border-default space-y-3 rounded-lg border p-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">End Date</span>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="isPresent" type="checkbox" class="rounded" :disabled="loading" />
              <span class="text-muted text-sm">Currently working here</span>
            </label>
          </div>

          <div v-if="!isPresent" class="grid grid-cols-2 gap-4">
            <UFormField label="End Month" name="endMonth">
              <USelect
                v-model="state.endMonth"
                :items="monthOptions"
                value-key="value"
                label-key="label"
                class="w-full"
                :disabled="loading"
                placeholder="Month"
              />
            </UFormField>

            <UFormField label="End Year" name="endYear">
              <UInput
                v-model.number="state.endYear"
                type="number"
                min="1900"
                max="2100"
                placeholder="2024"
                class="w-full"
                :disabled="loading"
              />
            </UFormField>
          </div>
          <p v-else class="text-muted text-sm italic">
            This will appear as "Present" on your profile.
          </p>
        </div>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            placeholder="Describe your responsibilities and achievements..."
            class="w-full"
            :rows="3"
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
