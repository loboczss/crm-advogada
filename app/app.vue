
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
  const publicPages = ['/login', '/confirm', '/recovery', '/privacidade', '/auth/dropbox']
  return !publicPages.includes(route.path)
})

const defaultTitle = 'Evastur'
useHead({
  title: defaultTitle,
  titleTemplate: (titleChunk) => {
    return titleChunk && titleChunk !== defaultTitle ? `${titleChunk} | Evastur` : 'Evastur Cloud'
  },
  meta: [
    { name: 'description', content: 'Plataforma inteligente de CRM e gestão' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/icon-192.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
  ]
})
</script>

<style>
/* Estilos globais movidos para app/assets/css/main.css */
</style>

