<template>
	<aside class="flex h-screen w-[250px] flex-col">
		<SidebarHeader title="Portofolio Dashboard" />
		<SidebarMenu />
		<SidebarFooter :is-authenticated="isAuthenticated" @sign-in="handleSignIn" @logout="handleLogout" />
	</aside>
	<USeparator orientation="vertical" class="h-screen" />
</template>

<script setup lang="ts">
	import { ref } from 'vue';

	const isAuthenticated = ref<boolean>(false);

	const handleSignIn = (): void => {
		console.log('Sign in clicked');
	};

	const handleLogout = (): void => {
		console.log('Logout clicked');
	};
</script>
