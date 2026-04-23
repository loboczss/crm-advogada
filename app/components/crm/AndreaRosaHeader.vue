<script setup lang="ts">
import Button from '../Button.vue'

const emits = defineEmits(['add'])
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-zinc-800/50 mb-8 mt-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
        <Icon name="ph:address-book-duotone" class="text-xl text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">CRM Andréa Rosa</h1>
        <p class="text-xs text-gray-500 dark:text-zinc-400">Gestão de leads e oportunidades</p>
      </div>
    </div>
    
    <div class="flex items-center">
      <Button 
        @click="emits('add')"
        variant="primary"
        size="sm"
        icon="ph:plus-bold"
        class="shadow-none"
      >
        Novo Lead
      </Button>
    </div>
  </div>
</template>
