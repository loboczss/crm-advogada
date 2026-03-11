<template>
  <NuxtLayout>
    <div id="eva-page" class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        
        <!-- Header & Tabs -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Configurações da <span class="text-primary">EVA</span>
            </h1>
            <p class="text-slate-500 dark:text-slate-400 mt-1">
              Personalize o comportamento e a base de conhecimento da sua assistente virtual.
            </p>
          </div>

          <!-- Tab Navigation -->
          <div class="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm self-start">
            <button
              @click="activeTab = 'prompt'"
              :class="[
                'px-6 py-2.5 text-sm font-bold transition-all duration-300 rounded-lg',
                activeTab === 'prompt' 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              System Prompt
            </button>
            <button
              @click="activeTab = 'dados'"
              :class="[
                'px-6 py-2.5 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-2',
                activeTab === 'dados' 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              Dados
              
            </button>
          </div>
        </div>

        <!-- Dynamic Content -->
        <div class="mt-8 transition-all duration-500">
          <KeepAlive>
            <component :is="currentTabComponent" />
          </KeepAlive>
        </div>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from '#imports'
import EvaSystemPrompt from '../components/eva/EvaSystemPrompt.vue'
import EvaDataTab from '../components/eva/EvaDataTab.vue'

useHead({ title: 'Configurações EVA | Evastur' })
definePageMeta({ middleware: ['auth'] })

const activeTab = ref<'prompt' | 'dados'>('prompt')

const currentTabComponent = computed(() => {
  return activeTab.value === 'prompt' ? EvaSystemPrompt : EvaDataTab
})
</script>
