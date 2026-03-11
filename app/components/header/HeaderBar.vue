<template>
  <header class="sticky top-0 z-[100] w-full border-b border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-all duration-300">
    <div class="px-6 py-2.5">
      <div class="container mx-auto flex items-center justify-between h-12 gap-8">
        
        <!-- Branding (Left) -->
        <div class="flex items-center gap-6 shrink-0">
          <div 
            class="flex items-center gap-3 cursor-pointer group" 
            @click="navigateTo('/')"
          >
            <div class="relative">
              <img src="/logo-blue.svg" alt="Evastur" class="h-8 w-auto dark:hidden select-none transition-transform duration-300 group-hover:scale-105" />
              <img src="/logo-white.svg" alt="Evastur" class="h-8 w-auto hidden dark:block select-none transition-transform duration-300 group-hover:scale-105" />
            </div>
            
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                {{ pageTitle }}
              </span>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight leading-normal">
                Evastur Cloud
              </span>
            </div>
          </div>
        </div>

        <VitePwaManifest />

        <!-- Navigation (Center) -->
        <nav class="hidden md:flex items-center justify-center flex-1 gap-1">
          <NuxtLink 
            v-for="item in navItems"
            :key="item.path"
            :to="item.path" 
            class="px-4 py-2 text-sm font-medium tracking-tight transition-all rounded-lg select-none relative group/link"
            :class="isActive(item.path) 
              ? 'text-primary dark:text-white bg-primary/5 dark:bg-white/5' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Actions (Right) -->
        <div class="flex items-center gap-1 sm:gap-3 shrink-0">
          <DarkModeToggle />
          <div class="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          <HeaderProfile />
          
          <!-- Mobile Menu Toggle -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div 
        v-show="isMobileMenuOpen" 
        class="md:hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 px-4 py-4 space-y-1"
      >
        <NuxtLink 
          v-for="item in navItems"
          :key="item.path"
          @click="isMobileMenuOpen = false" 
          :to="item.path" 
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors"
          :class="isActive(item.path) 
            ? 'text-primary dark:text-white bg-primary/5 dark:bg-white/5' 
            : 'text-slate-500 dark:text-slate-400'"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo, useRoute } from '#imports'
import DarkModeToggle from '../DarkModeToggle.vue'
import HeaderProfile from './HeaderProfile.vue'

const isMobileMenuOpen = ref(false)
const route = useRoute()

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Relatórios', path: '/relatorios' },
  { label: 'Vendas', path: '/vendas' },
  { label: 'CRM', path: '/crm/evastur' },
  { label: 'EVA', path: '/eva' }
]

// Map routes to friendly names
const pageTitle = computed(() => {
  if (route.path === '/') return 'Dashboard'
  if (route.path.startsWith('/relatorios')) return 'Relatórios'
  if (route.path.startsWith('/vendas')) return 'Vendas'
  if (route.path.startsWith('/crm')) return 'CRM'
  if (route.path.startsWith('/eva')) return 'EVA'
  if (route.path.startsWith('/profile')) return 'Meu Perfil'
  return 'Evastur'
})

// Check if a path is the currently active route
const isActive = (path: string) => {
  if (path === '/' && route.path === '/') return true
  if (path !== '/' && route.path.startsWith(path)) return true
  return false
}
</script>
