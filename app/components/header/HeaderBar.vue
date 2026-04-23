<template>
  <header 
    class="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-[100] w-full transition-all duration-300"
  >
    <div class="px-2 sm:px-4 lg:px-6 py-2">
      <div class="container mx-auto flex items-center justify-between h-12 md:h-13 lg:h-14 gap-2 sm:gap-3 lg:gap-6">
        
        <!-- Branding (Left) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div 
            class="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0" 
            @click="navigateTo('/')"
          >
            <div class="relative">
              <img src="/logo-andrea-rosa.png" alt="Andréa Rosa" class="dark:hidden h-6 sm:h-7 lg:h-8 w-auto select-none transition-transform duration-300 group-hover:scale-105" />
              <img src="/logo-andrea-rosa-white.png" alt="Andréa Rosa" class="hidden dark:block h-6 sm:h-7 lg:h-8 w-auto select-none transition-transform duration-300 group-hover:scale-105" />
            </div>
          </div>
        </div>

        <VitePwaManifest />

        <!-- Navigation (Center) -->
        <nav v-if="!isPublicPage || user" class="hidden lg:flex items-center justify-center flex-1 gap-1 min-w-0">
          <NuxtLink 
            v-for="item in navItems"
            :key="item.path"
            :to="item.path" 
            class="px-2.5 xl:px-4 h-9 xl:h-10 inline-flex items-center text-xs xl:text-sm font-medium tracking-tight transition-all rounded-md select-none relative group/link whitespace-nowrap"
            :class="isActive(item.path) 
              ? 'text-primary dark:text-white bg-primary/5 dark:bg-white/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Actions (Right) -->
        <div class="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
          <template v-if="user">
            <HeaderNotifications />
            <HeaderProfile />
          </template>
          <template v-else>
            <HeaderLoginButton />
          </template>

          <div class="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-0.5 hidden md:block"></div>
          <DarkModeToggle />
          
          <!-- Mobile Menu Toggle -->
          <button 
            v-if="!isPublicPage"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="h-10 w-10 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
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
        class="lg:hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 px-3 py-3 space-y-1"
      >
        <NuxtLink 
          v-for="item in navItems"
          :key="item.path"
          @click="isMobileMenuOpen = false" 
          :to="item.path" 
          class="flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors"
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
import { storeToRefs } from 'pinia'
import { useRoute, useSupabaseUser, navigateTo } from '#imports'
import { useProfileStore } from '../../stores/profile'
import DarkModeToggle from '../DarkModeToggle.vue'
import HeaderNotifications from './HeaderNotifications.vue'
import HeaderProfile from './HeaderProfile.vue'
import HeaderLoginButton from './HeaderLoginButton.vue'

const isMobileMenuOpen = ref(false)
const route = useRoute()
const user = useSupabaseUser()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const isPublicPage = computed(() => {
  const publicPaths = ['/', '/login', '/confirm', '/recovery', '/privacidade']
  // If user is logged in, we treat pages as "app pages" for header purposes
  if (user.value) return false
  return publicPaths.includes(route.path)
})

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Relatórios', path: '/relatorios' },
    { label: 'Atendimentos', path: '/vendas' },
    { label: 'CRM', path: '/crm/andrearosa' }
  ]

  const role = profile.value?.role
  if (role === 'admin' || role === 'vendedor') {
    items.push({ label: 'Andréa', path: '/eva' })
  }

  return items
})

// Map routes to friendly names
const pageTitle = computed(() => {
  if (route.path === '/') return 'Home'
  if (route.path.startsWith('/dashboard')) return 'Dashboard'
  if (route.path.startsWith('/relatorios')) return 'Relatórios'
  if (route.path.startsWith('/vendas')) return 'Atendimentos'
  if (route.path.startsWith('/crm')) return 'CRM'
  if (route.path.startsWith('/eva')) return 'Andréa'
  if (route.path.startsWith('/profile')) return 'Meu Perfil'
  return 'Andréa Rosa'
})

// Check if a path is the currently active route
const isActive = (path: string) => {
  if (path === '/' && route.path === '/') return true
  if (path !== '/' && route.path.startsWith(path)) return true
  return false
}
</script>
