<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <SharedThemeToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <p>Testing new dashboard template</p>
    </template>
  </UDashboardPanel>
</template>
