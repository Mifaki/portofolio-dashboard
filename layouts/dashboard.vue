<script setup lang="ts"></script>

<template>
	<main class="flex overflow-hidden">
		<Sidebar />
		<div class="w-full">
			<Header />
			<slot />
		</div>
	</main>
</template>
