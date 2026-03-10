<script setup lang="ts">
import PrivacyContent from '../components/privacidade/PrivacyContent.vue'
import DarkModeToggle from '../components/DarkModeToggle.vue'

// Esta página deve ser acessível sem login
definePageMeta({
  layout: false,
  middleware: []
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
    <!-- Mini Header -->
    <header class="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
      <NuxtLink to="/login" class="flex items-center gap-3 group">
        <div class="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
          <Icon name="ph:arrow-left-bold" class="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <span class="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors italic">Voltar</span>
      </NuxtLink>
      
      <div class="flex items-center gap-6">
        <img src="/logo-blue.svg" alt="Evastur Logo" class="h-8 w-auto dark:hidden opacity-80" />
        <img src="/logo-white.svg" alt="Evastur Logo" class="h-8 w-auto hidden dark:block opacity-60" />
        <div class="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
        <DarkModeToggle />
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto pb-20">
      <PrivacyContent />
      
      <div class="mt-8 text-center text-slate-400 dark:text-slate-600 text-xs font-medium uppercase tracking-widest italic">
        © {{ new Date().getFullYear() }} Evastur • Todos os direitos reservados
      </div>
    </main>
  </div>
</template>
