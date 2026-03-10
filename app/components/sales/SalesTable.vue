<template>
  <div id="sales-table-container">
    <DataTable
      :columns="columns"
      :data="filteredVendas"
      key-field="id"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :current-sort="sortBy"
      :sort-order="sortOrder"
      :column-filters="columnFilters"
      @page-change="emit('page-change', $event)"
      @sort="emit('sort', $event)"
      @column-filter="(col, val) => emit('column-filter', col, val)"
      @row-click="emit('row-click', $event)"
    >
      <!-- Header Extendido -->
      <template #header>
        <div class="px-8 py-7 border-b border-border-light dark:border-white/5 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-surface-light dark:bg-white/5 shadow-inner">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary/10 rounded-2xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-text-light dark:text-white mb-0.5">Histórico de Transações</h2>
              <p class="text-xs text-text-light/50 dark:text-text-dark/40 font-semibold uppercase tracking-wider">Gestão inteligente de vendas</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 w-full lg:w-auto">
            <div class="relative flex-1 lg:w-72">
              <input
                v-model="search"
                type="text"
                placeholder="Pesquisa rápida..."
                class="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border-none bg-white dark:bg-background-dark/50 ring-1 ring-border-light dark:ring-white/10 text-text-light dark:text-white placeholder:text-text-light/30 focus:ring-2 focus:ring-primary/40 transition-all duration-300 shadow-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-light/30">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <div class="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 whitespace-nowrap">
              <p class="text-[10px] font-black uppercase tracking-widest text-primary">
                {{ total }} TOTAL
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Cells -->

      <template #cell-contact_name="{ item: venda }">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-light to-border-light dark:from-background-dark dark:to-surface-dark flex items-center justify-center text-primary shadow-sm border border-border-light dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-sm font-black">{{ (venda.contact_name ?? '?')[0]?.toUpperCase() }}</span>
          </div>
          <div>
            <p class="text-sm font-black text-text-light dark:text-text-dark group-hover:text-primary transition-colors duration-300">{{ venda.contact_name ?? 'Cliente Desconhecido' }}</p>
            <p class="text-[10px] font-bold text-text-light/30 dark:text-text-dark/30 tracking-wider">CRM: {{ venda.contato_id }}</p>
          </div>
        </div>
      </template>

      <template #cell-vendedor="{ item: venda }">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary/30 ring-4 ring-primary/5"></span>
          <p class="text-xs font-bold text-text-light dark:text-text-dark/70 tracking-tight">{{ venda.vendedor ?? '-' }}</p>
        </div>
      </template>

      <template #cell-embarque="{ item: venda }">
        <p class="text-xs font-bold text-text-light/50 dark:text-text-dark/40 tracking-tight">{{ formatDate(venda.embarque) }}</p>
      </template>

      <template #cell-valor_venda="{ item: venda }">
        <div class="inline-flex flex-col items-end">
          <p class="text-sm font-black text-text-light dark:text-white">
            {{ formatCurrency(venda.valor_venda) }}
          </p>
          <div v-if="venda.comissao" class="text-[9px] font-black text-success uppercase tracking-widest mt-0.5">
            + {{ formatCurrency(venda.comissao) }} comissão
          </div>
        </div>
      </template>

      <template #cell-created_at="{ item: venda }">
        <p class="text-xs font-bold text-text-light/30 dark:text-text-dark/30">{{ formatDate(venda.created_at) }}</p>
      </template>

      <template #cell-status="{ item: venda }">
        <span
          class="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset transition-all duration-300 group-hover:brightness-110"
          :class="statusStyles(venda.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-2" :class="statusStyles(venda.status, true)"></span>
          {{ venda.status ?? '-' }}
        </span>
      </template>

      <template #cell-actions="{ item: venda }">
        <div class="flex items-center justify-end gap-2 pr-2">
          <button
            @click.stop="emit('delete', venda.id)"
            class="p-2.5 rounded-xl text-text-light/10 dark:text-text-dark/10 hover:text-danger hover:bg-danger/10 hover:ring-1 hover:ring-danger/20 transition-all duration-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
            title="Excluir"
          >
            <svg v-if="deleting !== venda.id" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </button>
        </div>
      </template>

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Venda } from '../../../shared/types/VendaDTO'
import DataTable from '../DataTable.vue'
import type { ColumnDef } from '../DataTable.vue'

interface Props {
  vendas: Venda[]
  loading?: boolean
  deleting?: number | null
  total?: number
  currentPage?: number
  totalPages?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  columnFilters: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  deleting: null,
  total: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 25,
  sortBy: 'created_at',
  sortOrder: 'desc',
})

const emit = defineEmits<{
  delete: [id: number]
  'page-change': [page: number]
  sort: [field: string]
  'column-filter': [column: string, value: string]
  'row-click': [venda: Venda]
}>()

const search = ref('')

const columns: ColumnDef[] = [
  { key: 'contact_name', label: 'Cliente', sortable: true, filterable: true, align: 'left' },
  { key: 'vendedor', label: 'Vendedor', sortable: true, filterable: true, align: 'left' },
  { key: 'embarque', label: 'Embarque', sortable: true, filterable: true, align: 'left' },
  { key: 'valor_venda', label: 'Valor', sortable: true, align: 'right' },
  { key: 'created_at', label: 'Data', sortable: true, align: 'center' },
  { key: 'status', label: 'Status', sortable: true, filterable: true, align: 'center' },
  { key: 'actions', label: 'Ações', align: 'right' },
]

const filteredVendas = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return props.vendas
  return props.vendas.filter(
    (v) =>
      (v.contact_name ?? '').toLowerCase().includes(q) ||
      (v.vendedor ?? '').toLowerCase().includes(q)
  )
})

const statusStyles = (status: string | null, isDot = false): string => {
  const s = (status ?? '').toLowerCase()
  if (isDot) {
    switch (s) {
      case 'confirmado': case 'emitida': return 'bg-success'
      case 'pendente': case 'em processo': return 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      case 'cancelado': return 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      default: return 'bg-text-light/20 dark:bg-text-dark/20'
    }
  }

  switch (s) {
    case 'confirmado': case 'emitida':
      return 'bg-success/10 text-success ring-success/30'
    case 'pendente': case 'em processo':
      return 'bg-warning/10 text-warning ring-warning/30'
    case 'cancelado':
      return 'bg-danger/10 text-danger ring-danger/30'
    default:
      return 'bg-text-light/5 text-text-light/40 dark:bg-white/5 dark:text-text-dark/40 ring-border-light dark:ring-white/5 font-bold'
  }
}

const formatCurrency = (val: number | null) => 
  val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-'

const formatDate = (date: string | null) => 
  date ? new Date(date).toLocaleDateString('pt-BR') : '-'
</script>
