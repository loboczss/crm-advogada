<template>
  <div id="sales-header" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Histórico de Atendimentos</h1>
      <p class="text-sm text-slate-500 dark:text-gray-400 mt-1">Gerencie e acompanhe todos os atendimentos realizados.</p>
    </div>
    <Button
      id="btn-novo-atendimento"
      variant="primary"
      size="md"
      @click="emit('open-modal')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Novo Atendimento
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '../Button.vue'

const emit = defineEmits<{ 'open-modal': [] }>()
</script>
