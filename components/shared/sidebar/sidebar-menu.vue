<template>
	<nav class="flex-1 px-2 py-4">
		<ul class="space-y-1">
			<li v-for="item in navigationItems" :key="item.to">
				<NuxtLink
					:to="item.to"
					:class="[
						'flex items-center gap-x-2 rounded-md px-3 py-2 transition-colors',
						route === item.to
							? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-500',
					]"
				>
					<UIcon :name="item.icon" class="h-5 w-5" />
					<span>{{ item.label }}</span>
				</NuxtLink>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
	import { useRoute } from 'vue-router';
	import { navigationItems } from '~/static/navigation';

	const route = useRoute().path;
</script>
