// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	app: {
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			title: 'Portofolio Dashboard',
			meta: [
				{
					name: 'description',
					content: "Management System for Ahmad Faiz's Portofollio Website",
				},
			],
		},
	},
	modules: ['@nuxt/eslint'],
	vite: { plugins: [tailwindcss()] },
});
