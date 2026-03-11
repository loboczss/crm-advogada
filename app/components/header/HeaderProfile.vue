<template>
  <Dropdown align="right" width="w-64">
    <template #trigger="{ isOpen }">
      <div 
        class="flex items-center gap-2 sm:gap-4 group cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 p-1 sm:px-3 sm:py-1.5 rounded-2xl transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/10 select-none"
        :class="{ 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10': isOpen }"
      >
        <div class="relative shrink-0">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary/20 text-primary dark:text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:shadow-glow-primary/20 transition-all duration-500">
            {{ initials }}
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-sm animate-pulse"></span>
        </div>
        <div class="leading-tight hidden sm:block">
          <p class="text-[11px] font-bold uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
            {{ displayName }}
            <svg 
              class="w-3 h-3 transition-transform duration-300 shrink-0" 
              :class="{ 'rotate-180': isOpen }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
            </svg>
          </p>
          <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight truncate max-w-[120px]">
            {{ emailText }}
          </p>
        </div>
      </div>
    </template>

    <template #content="{ close }">
      <div class="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-1 sm:hidden">
        <p class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">{{ displayName }}</p>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ emailText }}</p>
      </div>

      <button 
        @click="() => { handleProfile(); close(); }"
        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary-400 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Meu Perfil
      </button>

      <button 
        @click="() => { handleLogout(); close(); }"
        class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger/5 transition-colors mt-1 border-t border-slate-100 dark:border-white/5 pt-3"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sair da Conta
      </button>
    </template>
  </Dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupabaseUser, useSupabaseClient, navigateTo } from '#imports'
import Dropdown from '../Dropdown.vue'

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const displayName = computed(() => {
  const metadata = user.value?.user_metadata as { name?: string } | undefined
  return metadata?.name || 'Perfil'
})

const emailText = computed(() => {
  return user.value?.email || 'usuario@evastur.com'
})

const initials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return 'U'
  const parts = name.split(' ')
  const letters = parts.slice(0, 2).map((part) => part[0]).join('')
  return letters.toUpperCase()
})

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

function handleProfile() {
  navigateTo('/profile')
}
</script>
