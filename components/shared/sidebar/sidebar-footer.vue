<template>
	<USeparator class="w-full" />
	<div class="px-4 py-4">
		<UButton v-if="!isAuthenticated" block color="neutral" variant="outline" @click="emit('sign-in')">
			<template #leading>
				<UIcon name="i-heroicons-arrow-right-on-rectangle" />
			</template>
			Sign In
		</UButton>
		<UButton v-else block color="error" variant="soft" @click="emit('logout')">
			<template #leading>
				<UIcon name="i-heroicons-arrow-left-on-rectangle" />
			</template>
			Logout
		</UButton>
	</div>
</template>

<script setup lang="ts">
	interface Props {
		isAuthenticated: boolean;
	}

	interface Emits {
		(e: 'sign-in' | 'logout'): void;
	}
	const props = withDefaults(defineProps<Props>(), {
		isAuthenticated: false,
	});

	const emit = defineEmits<Emits>();
</script>
