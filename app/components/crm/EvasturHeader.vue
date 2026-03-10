<script setup lang="ts">
import Button from '../Button.vue'

const emits = defineEmits(['add'])
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-card mb-6 rounded-3xl">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="ph:address-book-duotone" class="text-blue-500" />
        CRM Evastur
      </h1>
      <p class="text-slate-500 dark:text-gray-400 text-sm">Gestão de leads e oportunidades de viagem.</p>
    </div>
    
    <div class="flex items-center gap-3">
      <Button 
        @click="emits('add')"
        variant="primary"
        icon="ph:plus-bold"
      >
        Novo Lead
      </Button>
    </div>
  </div>
</template>
