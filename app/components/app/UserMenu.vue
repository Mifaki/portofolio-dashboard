<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
    collapsed?: boolean
}>()

const { preference, setPreference } = useThemePreference()

const user = ref({
    name: 'Benjamin Canac',
    avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'Benjamin Canac'
    }
})

const items = computed<DropdownMenuItem[][]>(() => ([[{
    type: 'label',
    label: user.value.name,
    avatar: user.value.avatar
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
    label: 'GitHub repository',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/nuxt-ui-templates/dashboard',
    target: '_blank'
}, {
    label: 'Log out',
    icon: 'i-lucide-log-out'
}]]))
</script>

<template>
    <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        <UButton v-bind="{
            ...user,
            label: collapsed ? undefined : user?.name,
            trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
        }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated" :ui="{
            trailingIcon: 'text-dimmed'
        }" />

        <template #chip-leading="{ item }">
            <div class="inline-flex items-center justify-center shrink-0 size-5">
                <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                    '--chip-light': `var(--color-${(item as any).chip}-500)`,
                    '--chip-dark': `var(--color-${(item as any).chip}-400)`
                }" />
            </div>
        </template>
    </UDropdownMenu>
</template>