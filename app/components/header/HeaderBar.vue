<template>
  <header 
    class="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-[100] w-full transition-all duration-300"
  >
    <div class="px-6 py-2.5">
      <div class="container mx-auto flex items-center justify-between h-12 gap-8">
        
        <!-- Branding (Left) -->
        <div class="flex items-center gap-6 shrink-0">
          <div 
            class="flex items-center gap-3 cursor-pointer group" 
            @click="navigateTo('/')"
          >
            <div class="relative">
              <img src="/logo-blue.svg" alt="Evastur" class="dark:hidden h-8 w-auto select-none transition-transform duration-300 group-hover:scale-105" />
              <img src="/logo-white.svg" alt="Evastur" class="hidden dark:block h-8 w-auto select-none transition-transform duration-300 group-hover:scale-105" />
            </div>
            
            <div class="flex flex-col">
              <span 
                class="text-sm font-bold tracking-tight leading-none text-slate-900 dark:text-white"
              >
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
        <nav v-if="!isPublicPage || user" class="hidden md:flex items-center justify-center flex-1 gap-1">
          <NuxtLink 
            v-for="item in navItems"
            :key="item.path"
            :to="item.path" 
            class="px-4 py-2 text-sm font-medium tracking-tight transition-all rounded-md select-none relative group/link"
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
          
          <template v-if="!user">
            <HeaderLoginButton />
          </template>
          <template v-else>
            <HeaderProfile />
          </template>
          
          <!-- Mobile Menu Toggle -->
          <button 
            v-if="!isPublicPage"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden p-2 transition-colors"
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
          class="flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors"
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
import { useRoute, useSupabaseUser, navigateTo } from '#imports'
import DarkModeToggle from '../DarkModeToggle.vue'
import HeaderProfile from './HeaderProfile.vue'
import HeaderLoginButton from './HeaderLoginButton.vue'

const isMobileMenuOpen = ref(false)
const route = useRoute()
const user = useSupabaseUser()

const isPublicPage = computed(() => {
  const publicPaths = ['/', '/login', '/confirm', '/recovery', '/privacidade']
  // If user is logged in, we treat pages as "app pages" for header purposes
  if (user.value) return false
  return publicPaths.includes(route.path)
})

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Relatórios', path: '/relatorios' },
  { label: 'Vendas', path: '/vendas' },
  { label: 'CRM', path: '/crm/evastur' },
  { label: 'EVA', path: '/eva' }
]

// Map routes to friendly names
const pageTitle = computed(() => {
  if (route.path === '/') return 'Home'
  if (route.path.startsWith('/dashboard')) return 'Dashboard'
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
