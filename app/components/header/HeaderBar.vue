<template>
  <header class="sticky top-0 z-[100] w-full border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl transition-colors duration-500">
    <div class="px-4 py-3">
      <div class="container mx-auto flex items-center justify-between h-full gap-4">
        
        <!-- Branding (Left) -->
        <div class="flex items-center gap-4 lg:gap-8 shrink-0">
          <div 
            class="flex items-center cursor-pointer" 
            @click="navigateTo('/')"
          >
            <img src="/logo-blue.svg" alt="Evastur" class="h-9 lg:h-10 w-auto dark:hidden select-none hover:scale-[1.05] transition-transform duration-500" />
            <img src="/logo-white.svg" alt="Evastur" class="h-9 lg:h-10 w-auto hidden dark:block select-none hover:scale-[1.05] transition-transform duration-500" />
          </div>

          <div class="hidden lg:flex items-center h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2"></div>

          <div class="flex flex-col justify-center">
            <h1 class="text-[12px] font-black uppercase tracking-widest text-primary dark:text-white leading-tight">
              {{ pageTitle }}
            </h1>
            <p v-if="pageTitle !== 'Dashboard'" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              Evastur Cloud
            </p>
          </div>
        </div>

        <VitePwaManifest />

        <!-- Navigation (Center) -->
        <nav class="hidden md:flex items-center justify-center flex-1 gap-6 lg:gap-10">
          <NuxtLink 
            to="/" 
            class="text-[10px] lg:text-[11px] font-black uppercase tracking-[.25em] transition-all relative group/link py-2 select-none"
            :class="isActive('/') ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
          >
            Dashboard
            <span 
              class="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 shadow-glow-primary"
              :class="isActive('/') ? 'w-full' : 'w-0 group-hover/link:w-full'"
            ></span>
          </NuxtLink>
          <NuxtLink 
            to="/relatorios" 
            class="text-[10px] lg:text-[11px] font-black uppercase tracking-[.25em] transition-all relative group/link py-2 select-none"
            :class="isActive('/relatorios') ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
          >
            Relatórios
            <span 
              class="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 shadow-glow-primary"
              :class="isActive('/relatorios') ? 'w-full' : 'w-0 group-hover/link:w-full'"
            ></span>
          </NuxtLink>
          <NuxtLink 
            to="/vendas" 
            class="text-[10px] lg:text-[11px] font-black uppercase tracking-[.25em] transition-all relative group/link py-2 select-none"
            :class="isActive('/vendas') ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
          >
            Vendas
            <span 
              class="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 shadow-glow-primary"
              :class="isActive('/vendas') ? 'w-full' : 'w-0 group-hover/link:w-full'"
            ></span>
          </NuxtLink>
          <NuxtLink 
            to="/crm/evastur" 
            class="text-[10px] lg:text-[11px] font-black uppercase tracking-[.25em] transition-all relative group/link py-2 select-none"
            :class="isActive('/crm/evastur') ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
          >
            CRM
            <span 
              class="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 shadow-glow-primary"
              :class="isActive('/crm/evastur') ? 'w-full' : 'w-0 group-hover/link:w-full'"
            ></span>
          </NuxtLink>
          <NuxtLink 
            to="/eva" 
            class="text-[10px] lg:text-[11px] font-black uppercase tracking-[.25em] transition-all relative group/link py-2 select-none"
            :class="isActive('/eva') ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
          >
            EVA
            <span 
              class="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 shadow-glow-primary"
              :class="isActive('/eva') ? 'w-full' : 'w-0 group-hover/link:w-full'"
            ></span>
          </NuxtLink>

        </nav>

        <!-- Actions (Right) -->
        <div class="flex items-center gap-2 sm:gap-4 shrink-0">
          <DarkModeToggle />
          <div class="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
          <HeaderProfile />
          
          <!-- Mobile Menu Toggle -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 -mr-2 text-slate-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div 
      v-show="isMobileMenuOpen" 
      class="md:hidden border-t border-black/5 dark:border-white/10 bg-white dark:bg-slate-950 px-4 py-4 space-y-4 shadow-lg"
    >
      <NuxtLink 
        @click="isMobileMenuOpen = false" 
        to="/" 
        class="block text-[11px] font-black uppercase tracking-[.25em] transition-colors relative"
        :class="isActive('/') ? 'text-primary dark:text-white pl-3' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
      >
        Dashboard
        <span v-if="isActive('/')" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></span>
      </NuxtLink>
      <NuxtLink 
        @click="isMobileMenuOpen = false" 
        to="/relatorios" 
        class="block text-[11px] font-black uppercase tracking-[.25em] transition-colors relative"
        :class="isActive('/relatorios') ? 'text-primary dark:text-white pl-3' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
      >
        Relatórios
        <span v-if="isActive('/relatorios')" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></span>
      </NuxtLink>
      <NuxtLink 
        @click="isMobileMenuOpen = false" 
        to="/vendas" 
        class="block text-[11px] font-black uppercase tracking-[.25em] transition-colors relative"
        :class="isActive('/vendas') ? 'text-primary dark:text-white pl-3' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
      >
        Vendas
        <span v-if="isActive('/vendas')" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></span>
      </NuxtLink>
      <NuxtLink 
        @click="isMobileMenuOpen = false" 
        to="/crm/evastur" 
        class="block text-[11px] font-black uppercase tracking-[.25em] transition-colors relative"
        :class="isActive('/crm/evastur') ? 'text-primary dark:text-white pl-3' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
      >
        CRM
        <span v-if="isActive('/crm/evastur')" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></span>
      </NuxtLink>
      <NuxtLink 
        @click="isMobileMenuOpen = false" 
        to="/eva" 
        class="block text-[11px] font-black uppercase tracking-[.25em] transition-colors relative"
        :class="isActive('/eva') ? 'text-primary dark:text-white pl-3' : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
      >
        EVA
        <span v-if="isActive('/eva')" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></span>
      </NuxtLink>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo, useRoute } from '#imports'
import DarkModeToggle from '../DarkModeToggle.vue'
import HeaderProfile from './HeaderProfile.vue'

const isMobileMenuOpen = ref(false)
const route = useRoute()

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
