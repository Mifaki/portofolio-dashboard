import type { INavigation } from '~/types/type.layout';

export const navigationItems: INavigation[] = [
	{
		label: 'Dashboard',
		icon: 'i-heroicons-home',
		to: '/dashboard',
	},
	{
		label: 'Projects',
		icon: 'i-heroicons-folder',
		to: '/dashboard/projects',
	},
	{
		label: 'Analytics',
		icon: 'i-heroicons-chart-bar',
		to: '/dashboard/analytics',
	},
	{
		label: 'Settings',
		icon: 'i-heroicons-cog-6-tooth',
		to: '/dashboard/settings',
	},
];
