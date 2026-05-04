<script setup lang="ts">
import { useRoles } from '~/composables/roles/useRoles'

const CLEAR = '__all__'

const modelValue = defineModel<string>({ default: '' })

const { roles, isLoading } = useRoles()

const items = computed(() => [
  { label: 'All Roles', value: CLEAR },
  ...roles.value.map(r => ({ label: r.name, value: r.id }))
])

const selected = computed({
  get: () => modelValue.value || CLEAR,
  set: (val: string) => { modelValue.value = val === CLEAR ? '' : val }
})
</script>

<template>
  <USelect 
    v-model="selected" 
    :items="items" 
    :loading="isLoading" 
    class="w-40" 
  />
</template>
