<script setup lang="ts">
const { preference, setPreference } = useThemePreference()

const themes = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' },
] as const

const current = computed(() => themes.find((t) => t.value === preference.value) ?? themes[2])

const items = computed(() => [
  themes.map((theme) => ({
    label: theme.label,
    icon: theme.icon,
    type: 'checkbox' as const,
    checked: preference.value === theme.value,
    onSelect(e: Event) {
      e.preventDefault()
      setPreference(theme.value)
    },
  })),
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end', collisionPadding: 8 }">
    <UButton
      :icon="current.icon"
      color="neutral"
      variant="ghost"
      :aria-label="`Switch theme (current: ${current.label})`"
    />
  </UDropdownMenu>
</template>
