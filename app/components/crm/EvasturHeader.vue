<script setup lang="ts">
const emits = defineEmits(['add'])
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
      <button 
        @click="emits('add')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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
