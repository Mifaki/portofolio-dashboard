<script setup lang="ts">
	interface Breadcrumb {
		label: string;
		to?: string;
		icon?: string;
	}

	const route = useRoute();
	const router = useRouter();

	const breadcrumbs = computed<Breadcrumb[]>(() => {
		const items: Breadcrumb[] = [
			{
				label: 'Home',
				icon: 'i-lucide-home',
				to: '/',
			},
		];

		const pathParts = route.path.split('/').filter((part) => part);

		let currentPath = '';
		pathParts.forEach((part, index) => {
			currentPath += `/${part}`;

			const matchedRoute = router.resolve(currentPath).matched[0];
			const meta = matchedRoute?.meta || {};

			const label = (meta.breadcrumb as string) || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

			items.push({
				label,
				to: currentPath,
			});
		});

		return items;
	});
</script>

<template>
	<UBreadcrumb :items="breadcrumbs">
		<template #separator>
			<span class="mx-2 text-(--ui-text-muted)">/</span>
		</template>
	</UBreadcrumb>
</template>
