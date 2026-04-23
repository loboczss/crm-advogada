<template>
  <div class="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Relatórios
        </h1>
        <p class="text-sm text-slate-500 dark:text-gray-400 mt-1">
          Acompanhamento detalhado das métricas de atendimentos e conversão.
        </p>
      </div>

      <!-- Date Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-md px-3 py-1.5 shadow-sm">
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">De</span>
          <input 
            type="date" 
            v-model="startDate"
            @change="fetchRankingData"
            class="bg-transparent text-sm font-medium text-slate-900 dark:text-white focus:outline-none w-32"
          />
        </div>
        <div class="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-md px-3 py-1.5 shadow-sm">
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Até</span>
          <input 
            type="date" 
            v-model="endDate"
            @change="fetchRankingData"
            class="bg-transparent text-sm font-medium text-slate-900 dark:text-white focus:outline-none w-32"
          />
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <Alert v-if="error" type="danger" :title="error" @close="error = ''" class="mb-6">
      Ocorreu um problema ao carregar os dados do ranking. Por favor, tente novamente.
    </Alert>

    <!-- Ranking Component -->
    <div class="w-full relative">
      <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div class="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
      </div>
      
      <RankingVendedores 
        :ranking="visibleRanking" 
        :has-hidden-sellers="hiddenSellers.size > 0"
        @refresh="fetchRankingData" 
        @hide="toggleSellerVisibility"
        @show-all="showAllSellers"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useHead } from '#imports'
import RankingVendedores from '../components/relatorios/RankingVendedores.vue'
import Alert from '../components/Alert.vue'
import { useRankingData } from '../composables/useRankingData'

useHead({ title: 'Relatórios | Andréa Rosa' })
definePageMeta({ middleware: 'auth' })

const { 
  loading, 
  error, 
  startDate, 
  endDate, 
  visibleRanking, 
  hiddenSellers, 
  fetchRankingData, 
  toggleSellerVisibility, 
  showAllSellers 
} = useRankingData()

onMounted(() => {
  fetchRankingData()
})
</script>
