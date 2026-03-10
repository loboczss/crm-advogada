
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30">
    <NuxtRouteAnnouncer />
    <HeaderBar v-if="showHeader" />
    <main :class="[showHeader ? 'max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12' : '']">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useHead } from '#imports'
import HeaderBar from './components/header/HeaderBar.vue'

const route = useRoute()

const showHeader = computed(() => {
  const publicPages = ['/login', '/confirm', '/recovery']
  return !publicPages.includes(route.path)
})

useHead({
  title: 'Evastur - Dashboard',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
  ]
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.font-sans {
  font-family: 'Inter', sans-serif;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
</style>

