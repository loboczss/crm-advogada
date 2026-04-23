<template>
  <Card variant="light" class="!p-0 overflow-hidden">
    <!-- Component Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 lg:p-8 border-b border-slate-100 dark:border-zinc-800/50">
      <div class="flex items-center gap-4">
        <!-- Icon -->
        <div class="w-12 h-12 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Icon name="ph:star-bold" class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Ranking de Consultores - Histórico</h2>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">Estatísticas de fechamentos e atendimentos</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <Button 
          v-if="hasHiddenSellers"
          variant="outline"
          size="sm"
          icon="ph:eye-bold"
          @click="$emit('show-all')"
        >
          Mostrar Ocultos
        </Button>

        <Button 
          variant="secondary"
          size="sm"
          icon="ph:arrows-clockwise-bold"
          @click="$emit('refresh')"
        >
          Atualizar
        </Button>
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :columns="columns"
      :data="ranking"
      key-field="id"
      class="!rounded-none !border-0 !shadow-none"
    >
      <template #cell-position="{ index }">
        <div 
          v-if="index === 0" 
          class="w-8 h-8 rounded-md bg-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30"
          title="1º Lugar"
        >
          <Icon name="ph:crown-fill" class="w-4 h-4" />
        </div>
        <div 
          v-else-if="index === 1" 
          class="w-8 h-8 rounded-md bg-slate-300 dark:bg-slate-400 text-white flex items-center justify-center mx-auto shadow-md"
          title="2º Lugar"
        >
          <span class="font-bold">2</span>
        </div>
        <div 
          v-else-if="index === 2" 
          class="w-8 h-8 rounded-md bg-orange-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20"
          title="3º Lugar"
        >
          <span class="font-bold">3</span>
        </div>
        <div v-else class="text-slate-900 dark:text-white font-bold group-hover:text-primary transition-colors">
          {{ index + 1 }}
        </div>
      </template>

      <template #cell-nome="{ item: seller }">
        <span class="font-bold text-slate-900 dark:text-white capitalize">{{ seller.nome }}</span>
      </template>

      <template #cell-clientes="{ item: seller }">
        <span class="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-3 py-1 rounded-md text-xs">
          {{ seller.clientes }}
        </span>
      </template>

      <template #cell-conversao="{ item: seller }">
        <span class="font-bold text-slate-800 dark:text-slate-200">
          {{ seller.conversao.toFixed(1) }}%
        </span>
      </template>

      <template #cell-valor="{ item: seller }">
        <span 
          class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold"
          :class="seller.valor > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
        >
          {{ formatCurrency(seller.valor) }}
        </span>
      </template>

      <template #cell-actions="{ item: seller }">
        <button 
          @click.stop="$emit('hide', seller.id)"
          class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Ocultar funcionário"
        >
          <Icon name="ph:eye-slash-bold" class="w-5 h-5" />
        </button>
      </template>
    </DataTable>
  </Card>
</template>

<script setup lang="ts">
import Card from '../Card.vue'
import DataTable from '../DataTable.vue'
import type { ColumnDef } from '../DataTable.vue'
import Button from '../Button.vue'

// Props
defineProps<{
  ranking: Array<{
    id: string | number;
    nome: string;
    vendas: number;
    valor: number;
    clientes: number;
    conversao: number;
  }>;
  hasHiddenSellers?: boolean;
}>()

// Emits
defineEmits<{
  (e: 'refresh'): void;
  (e: 'hide', sellerId: string | number): void;
  (e: 'show-all'): void;
}>()

const columns: ColumnDef[] = [
  { key: 'position', label: '#', align: 'center' },
  { key: 'nome', label: 'Consultor', align: 'left' },
  { key: 'clientes', label: 'Clientes At', align: 'center' },
  { key: 'vendas', label: 'Fechamentos', align: 'center' },
  { key: 'conversao', label: 'Conversão', align: 'center' },
  { key: 'valor', label: 'Valor Total', align: 'left' },
  { key: 'actions', label: 'Ações', align: 'center' },
]

// Helpers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
