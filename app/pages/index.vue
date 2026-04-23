<template>
  <div class="bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
    <!-- Abstract Background Patterns -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="max-w-4xl w-full text-center relative z-10">
      <!-- Badge/Intro -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
        <Icon name="ph:shield-check-fill" class="w-4 h-4" />
        Sistema Andréa Rosa Advocacia
      </div>

      <!-- Main Heading -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
        Bem-vindo ao Painel <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-700">Administrativo CRM</span>
      </h1>

      <p class="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
        Gerencie seus casos, monitore atendimentos e analise a performance do escritório Andréa Rosa em um só lugar com ferramentas avançadas de gestão.
      </p>

      <!-- Action Cards/Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
        <NuxtLink 
          to="/dashboard" 
          class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon name="ph:chart-line-up" class="w-16 h-16 text-primary" />
          </div>
          <div class="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <Icon name="ph:chart-pie-slice-fill" class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Visão geral de métricas, KPIs e performance em tempo real.</p>
          <div class="mt-4 flex items-center text-primary text-sm font-bold gap-1 group-hover:gap-2 transition-all">
            Acessar Painel <Icon name="ph:arrow-right-bold" class="w-4 h-4" />
          </div>
        </NuxtLink>

        <NuxtLink 
          to="/crm/andrearosa" 
          class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon name="ph:users-three" class="w-16 h-16 text-primary" />
          </div>
          <div class="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <Icon name="ph:user-list-fill" class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Gestão CRM</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Gerenciamento completo de clientes, contatos e histórico de atendimentos.</p>
          <div class="mt-4 flex items-center text-primary text-sm font-bold gap-1 group-hover:gap-2 transition-all">
            Acessar CRM <Icon name="ph:arrow-right-bold" class="w-4 h-4" />
          </div>
        </NuxtLink>
      </div>

      <!-- Quick Shortcuts -->
      <div class="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-500">
        <span class="font-medium mr-2">Acesso Rápido:</span>
        <NuxtLink to="/vendas" class="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="ph:receipt-bold" /> Atendimentos
        </NuxtLink>
        <span class="opacity-30">•</span>
        <NuxtLink to="/relatorios" class="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="ph:file-text-bold" /> Relatórios
        </NuxtLink>
        <span class="opacity-30">•</span>
        <NuxtLink to="/profile" class="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="ph:user-gear-bold" /> Perfil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead, onMounted, navigateTo } from '#imports'

onMounted(() => {
  // Check if we landed with a hash containing an auth token and type
  if (typeof window !== 'undefined' && window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1))
    const type = params.get('type')
    if (type === 'invite' || type === 'recovery') {
      navigateTo('/confirm' + window.location.hash)
    }
  }
})

useHead({
  title: 'Painel Administrativo - Andréa Rosa',
  meta: [
    { name: 'description', content: 'Área administrativa de CRM e Dashboard de Andréa Rosa Advocacia Previdenciária.' }
  ]
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

