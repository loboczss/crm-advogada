<template>
  <div id="sales-stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Standard metrics -->
    <KpiCard
      v-for="stat in stats"
      :key="stat.label"
      :title="stat.label"
      :value="stat.value"
      :sub-value="stat.sub"
      :icon="stat.icon"
      :color="stat.color"
      :loading="loading"
    />

    <!-- Maior Atendimento Card -->
    <KpiCard
      title="Maior Atendimento"
      badge="TOP"
      :loading="loading"
      color="primary"
    >
      <template #value>
         <template v-if="maiorVenda">
            <p class="text-2xl font-black text-primary">
              {{ maiorVenda.valor_venda != null
                ? maiorVenda.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '-' }}
            </p>
         </template>
         <template v-else>
            <p class="text-xl font-black text-slate-300 dark:text-slate-600">—</p>
         </template>
      </template>
      
      <template #description>
         <template v-if="maiorVenda">
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-1">{{ maiorVenda.contact_name ?? '-' }}</p>
            <p class="text-[10px] text-slate-400 dark:text-gray-500">{{ maiorVenda.contato_id }}</p>
         </template>
         <template v-else>
            <p class="text-xs text-slate-400 dark:text-gray-500 mt-1">Nenhum dado disponível</p>
         </template>
      </template>
    </KpiCard>
  </div>
</template>

<script setup lang="ts">
import KpiCard from '../KpiCard.vue'
import type { KpiColor } from '../KpiCard.vue'
import { computed } from 'vue'

interface MaiorVenda {
  id: number
  contact_name: string | null
  contato_id: string
  valor_venda: number | null
}

interface Props {
  totalVendas: number
  valorTotal: number
  ticketMedio: number
  maiorVenda: MaiorVenda | null
  loading?: boolean
}
const props = withDefaults(defineProps<Props>(), { loading: false, maiorVenda: null })

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Stat {
  label: string
  value: string
  sub: string
  icon: string
  color: KpiColor
}

const stats = computed<Stat[]>(() => [
  { label: 'Total de Atendimentos', value: props.totalVendas.toString(), sub: 'registros no histórico', icon: 'ph:briefcase-bold', color: 'neutral' },
  { label: 'Valor Total', value: formatCurrency(props.valorTotal), sub: 'soma de honorários', icon: 'ph:scales-bold', color: 'success' },
  { label: 'Ticket Médio', value: formatCurrency(props.ticketMedio), sub: 'média por contrato', icon: 'ph:chart-line-up-bold', color: 'info' },
])
</script>
