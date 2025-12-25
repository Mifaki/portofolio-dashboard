<script setup lang="ts">
	import type { TableColumn } from '@nuxt/ui';
	import { h, resolveComponent } from 'vue';
	import type { IRootProject } from '~/types/type.project';

	definePageMeta({
		layout: 'dashboard',
	});

	// Components
	const UBadge = resolveComponent('UBadge');
	const UDropdownMenu = resolveComponent('UDropdownMenu');
	const UButton = resolveComponent('UButton');

	const toast = useToast();

	// Sample data
	const data = ref<IRootProject[]>([
		{
			id: '12345',
			name: 'Kampung Budaya 2023',
			desc: 'testing',
			status: 'active',
		},
		{
			id: '12346',
			name: 'Digital Innovation Hub',
			desc: 'A hub for digital creators',
			status: 'inactive',
		},
		{
			id: '12347',
			name: 'Smart City Initiative',
			desc: 'Urban development project',
			status: 'active',
		},
	]);

	const columns: TableColumn<IRootProject>[] = [
		{
			accessorKey: 'id',
			header: 'Project ID',
			cell: ({ row }) => `#${row.getValue('id')}`,
		},
		{
			accessorKey: 'name',
			header: 'Name',
		},
		{
			accessorKey: 'desc',
			header: 'Description',
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const status = row.getValue('status') as string;
				const color = status === 'active' ? 'success' : 'error';

				return h(
					UBadge,
					{
						class: 'capitalize',
						variant: 'subtle',
						color,
					},
					() => status
				);
			},
		},
		{
			id: 'actions',
			header: () => h('div', { class: 'text-right' }, 'Actions'),
			cell: ({ row }) => {
				const items = [
					{
						label: 'View Details',
						icon: 'i-lucide-eye',
						onSelect() {
							// Handle view action
						},
					},
					{
						label: 'Edit Project',
						icon: 'i-lucide-edit',
						onSelect() {
							// Handle edit action
						},
					},
					{
						type: 'separator',
					},
					{
						label: 'Delete Project',
						icon: 'i-lucide-trash-2',
						color: 'red',
						onSelect() {
							// Handle delete action
						},
					},
				];

				return h(
					'div',
					{ class: 'text-right' },
					h(
						UDropdownMenu,
						{
							items,
							content: { align: 'end' },
						},
						() =>
							h(UButton, {
								icon: 'i-lucide-more-horizontal',
								color: 'neutral',
								variant: 'ghost',
								class: 'ml-auto',
							})
					)
				);
			},
		},
	];

	const table = useTemplateRef('table');

	// Search and filter functionality
	const searchQuery = ref('');
	const statusFilter = ref<string[]>([]);

	const filteredData = computed(() => {
		return data.value.filter((project) => {
			const matchesSearch =
				searchQuery.value === '' ||
				project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
				project.desc.toLowerCase().includes(searchQuery.value.toLowerCase());

			const matchesStatus = statusFilter.value.length === 0 || statusFilter.value.includes(project.status);

			return matchesSearch && matchesStatus;
		});
	});
</script>

<template>
	<main class="flex w-full flex-col gap-4">
		<Breadcrumb class="mb-6" />

		<!-- Table Controls -->
		<div class="mb-4 flex items-center justify-between gap-4">
			<div class="flex-1">
				<UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search projects..." class="max-w-sm" />
			</div>

			<div class="flex items-center gap-2">
				<USelect
					v-model="statusFilter"
					:options="['active', 'inactive']"
					multiple
					placeholder="Filter by status"
					class="w-48"
				/>

				<UButton color="primary" icon="i-lucide-plus" label="New Project" @click="() => {}" />
			</div>
		</div>

		<!-- Table -->
		<UTable
			ref="table"
			:data="filteredData"
			:columns="columns"
			:ui="{
				base: 'w-full border-separate border-spacing-0',
				thead: '[&>tr]:bg-gray-100 dark:[&>tr]:bg-gray-800',
				tbody: '[&>tr:hover]:bg-gray-50 dark:[&>tr:hover]:bg-gray-900',
				th: 'py-3 px-4 text-left font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-gray-400',
				td: 'py-3 px-4 border-b border-gray-200 dark:border-gray-700',
			}"
			hover
			:loading="false"
		>
			<template #loading-state>
				<div class="flex items-center justify-center py-6">
					<USpinner />
				</div>
			</template>
		</UTable>

		<!-- Pagination (Optional) -->
		<div class="flex items-center justify-between pt-4">
			<p class="text-sm text-gray-500">Showing {{ filteredData.length }} projects</p>

			<UPagination v-if="filteredData.length > 1" :total="filteredData.length" :per-page="10" class="justify-end" />
		</div>
	</main>
</template>
