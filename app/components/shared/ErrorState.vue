<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: 'Something went wrong. Please try again.',
  }
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <UIcon name="i-lucide-circle-alert" class="size-8 text-red-500" />
    <p class="text-muted text-sm">{{ message }}</p>
    <UButton label="Try again" variant="outline" color="neutral" @click="$emit('retry')" />
  </div>
</template>
