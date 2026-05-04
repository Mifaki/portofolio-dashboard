<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '~/composables/auth/useAuth'
import { useThemePreference } from '~/composables/useThemePreference'

defineProps<{
  collapsed?: boolean
}>()

const { preference, setPreference } = useThemePreference()
const { user, isAuthenticated, logout } = useAuth()

const displayName = computed(() => user.value?.username ?? 'Guest')
const displayEmail = computed(() => user.value?.email ?? '')

const items = computed<DropdownMenuItem[][]>(() => {
  if (!isAuthenticated.value) return []

  return [[{
    type: 'label',
    label: displayName.value,
    description: displayEmail.value
  }], [{
    label: 'Profile',
    icon: 'i-lucide-user'
  }, {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/settings'
  }], [{
    label: 'Appearance',
    icon: 'i-lucide-sun-moon',
    children: [{
      label: 'Light',
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: preference.value === 'light',
      onSelect(e: Event) {
        e.preventDefault()
        setPreference('light')
      }
    }, {
      label: 'Dark',
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: preference.value === 'dark',
      onSelect(e: Event) {
        e.preventDefault()
        setPreference('dark')
      }
    }, {
      label: 'System',
      icon: 'i-lucide-monitor',
      type: 'checkbox',
      checked: preference.value === 'system',
      onSelect(e: Event) {
        e.preventDefault()
        setPreference('system')
      }
    }]
  }], [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    onSelect: () => logout()
  }]]
})
</script>

<template>
  <template v-if="isAuthenticated">
    <UDropdownMenu
      :items="items"
      :content="{ align: 'center', collisionPadding: 12 }"
      :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    >
      <UButton
        :label="collapsed ? undefined : displayName"
        :avatar="{ text: displayName.slice(0, 2).toUpperCase() }"
        :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
        color="neutral"
        variant="ghost"
        block
        :square="collapsed"
        class="data-[state=open]:bg-elevated"
        :ui="{ trailingIcon: 'text-dimmed' }"
      />
    </UDropdownMenu>
  </template>

  <template v-else>
    <UButton
      :label="collapsed ? undefined : 'Sign in'"
      icon="i-lucide-log-in"
      block
      :square="collapsed"
      to="/login"
    />
  </template>
</template>
