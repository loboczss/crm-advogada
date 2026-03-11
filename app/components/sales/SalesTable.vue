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
        <div class="px-8 py-5 border-b border-gray-100 dark:border-zinc-800/50 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white dark:bg-zinc-900/50">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <div>
              <h2 class="text-base font-bold text-gray-900 dark:text-white leading-tight">Histórico de Transações</h2>
              <p class="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">Gestão inteligente de vendas</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="relative flex-1 lg:w-64">
              <input
                v-model="search"
                type="text"
                placeholder="Pesquisa rápida..."
                class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors shadow-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <div class="px-2.5 py-1 bg-gray-50 dark:bg-zinc-800 rounded border border-gray-100 dark:border-zinc-700 whitespace-nowrap">
              <p class="text-[9px] font-bold text-gray-500 dark:text-zinc-400">
                {{ total }} TOTAL
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Cells -->

      <template #cell-contact_name="{ item: venda }">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-zinc-700">
            <span class="text-xs font-semibold">{{ (venda.contact_name ?? '?')[0]?.toUpperCase() }}</span>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{{ venda.contact_name ?? 'Cliente Desconhecido' }}</p>
            <p class="text-[10px] text-gray-400 dark:text-zinc-500">CRM: {{ venda.contato_id }}</p>
          </div>
        </div>
      </template>

      <template #cell-vendedor="{ item: venda }">
        <div class="flex items-center gap-2">
          <p class="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-tight">{{ venda.vendedor ?? '-' }}</p>
        </div>
      </template>

      <template #cell-embarque="{ item: venda }">
        <p class="text-xs font-bold text-text-light/50 dark:text-text-dark/40 tracking-tight">{{ formatDate(venda.embarque) }}</p>
      </template>

      <template #cell-valor_venda="{ item: venda }">
        <div class="inline-flex flex-col items-end">
          <p class="text-sm font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(venda.valor_venda) }}
          </p>
          <div v-if="venda.comissao" class="text-[9px] font-bold text-emerald-500 uppercase mt-0.5">
            + {{ formatCurrency(venda.comissao) }} comissão
          </div>
        </div>
      </template>

      <template #cell-created_at="{ item: venda }">
        <p class="text-xs font-bold text-text-light/30 dark:text-text-dark/30">{{ formatDate(venda.created_at) }}</p>
      </template>

      <template #cell-status="{ item: venda }">
        <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-100 dark:border-zinc-800">
          <span class="w-1.5 h-1.5 rounded-full" :class="statusStyles(venda.status, true)"></span>
          <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400">{{ venda.status ?? '-' }}</span>
        </div>
      </template>

      <template #cell-actions="{ item: venda }">
        <div class="flex items-center justify-end gap-1.5 pr-2">
          <button
            @click.stop="emit('delete', venda.id)"
            class="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Excluir"
          >
            <svg v-if="deleting !== venda.id" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      case 'confirmado': case 'emitida': return 'bg-emerald-500'
      case 'pendente': case 'em processo': return 'bg-amber-500'
      case 'cancelado': return 'bg-rose-500'
      default: return 'bg-gray-300'
    }
  }

  return ''
}

const formatCurrency = (val: number | null) => 
  val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-'

const formatDate = (date: string | null) => 
  date ? new Date(date).toLocaleDateString('pt-BR') : '-'
</script>
