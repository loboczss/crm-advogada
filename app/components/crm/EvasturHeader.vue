<script setup lang="ts">
import { ref, watch } from 'vue'


const emits = defineEmits(['add', 'search'])
const searchQuery = ref('')

let debounceTimer: any = null
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emits('search', val)
  }, 300)
})
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-container mb-6 rounded-3xl">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="ph:address-book-duotone" class="text-blue-500" />
        CRM Evastur
      </h1>
      <p class="text-slate-500 dark:text-gray-400 text-sm">Gestão de leads e oportunidades de viagem.</p>
    </div>
    
    <div class="flex items-center gap-3">
      <div class="relative group">
        <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 dark:text-gray-400 group-focus-within:text-blue-400 transition-colors">
          <Icon name="ph:magnifying-glass-bold" size="20" />
        </span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar contatos..." 
          style="padding-left: 3.5rem !important;"
          class="bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-full py-2 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md w-full md:w-64 transition-all"
        />
      </div>
      
      <button 
        @click="emits('add')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
      >
        <Icon name="ph:plus-bold" />
        Novo Lead
      </button>
    </div>
  </div>
</template>

<style scoped>
.glass-container {
  @apply bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}

.dark .glass-container {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
</style>
