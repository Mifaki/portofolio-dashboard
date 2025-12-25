<script setup lang="ts"></script>

<template>
	<main class="flex h-screen overflow-hidden">
		<Sidebar />
		<div class="flex w-full flex-col">
			<Header />
			<div class="flex-1 overflow-auto p-10">
				<slot />
			</div>
		</div>
	</main>
</template>
