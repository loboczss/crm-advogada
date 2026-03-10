<template>
  <div id="evastur-table-container">
    <DataTable
      :columns="columns"
      :data="records"
      key-field="id"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="10"
      @page-change="emits('changePage', $event)"
      @row-click="emits('row-click', $event)"
    >
      <!-- Header Extendido Igual ao de Vendas -->
      <template #header>
        <div class="px-8 py-7 border-b border-border-light dark:border-white/5 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-surface-light dark:bg-white/5 shadow-inner">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary/10 rounded-2xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-text-light dark:text-white mb-0.5">Leads e Contatos</h2>
              <p class="text-xs text-text-light/50 dark:text-text-dark/40 font-semibold uppercase tracking-wider">Gestão de relacionamento Evastur</p>
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

      <template #cell-contato="{ item: record }">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-light to-border-light dark:from-background-dark dark:to-surface-dark flex items-center justify-center text-primary shadow-sm border border-border-light dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-sm font-black">{{ (record.nome ?? '?')[0]?.toUpperCase() }}</span>
          </div>
          <div>
            <p class="text-sm font-black text-text-light dark:text-text-dark group-hover:text-primary transition-colors duration-300">
              {{ record.nome || 'Sem Nome' }}
            </p>
            <p class="text-[10px] font-bold text-text-light/30 dark:text-text-dark/30 tracking-wider">
              {{ record.email || record.contato_id }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-localizacao="{ item: record }">
        <div class="flex flex-col gap-1.5 items-start">
          <p class="text-xs font-bold text-text-light/50 dark:text-text-dark/40 tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {{ record.cidade || 'Não informado' }}
          </p>
          <p v-if="record.nome_social" class="font-black text-[10px] text-primary tracking-widest uppercase">
            @{{ record.nome_social }}
          </p>
        </div>
      </template>

      <template #cell-contexto="{ item: record }">
        <div class="flex items-center gap-3">
          <span 
            class="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset transition-all duration-300 group-hover:brightness-110"
            :class="getUrgencyClass(record.urgencia)"
          >
            <span class="w-1.5 h-1.5 rounded-full mr-2" :class="getUrgencyClass(record.urgencia, true)"></span>
            {{ record.urgencia || 'Média' }}
          </span>
          <svg v-if="record.sentimento?.toLowerCase().includes('positivo')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-success">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
          <svg v-else-if="record.sentimento?.toLowerCase().includes('neutro')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-warning">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-danger">
             <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
        </div>
      </template>

      <template #cell-interesses="{ item: record }">
        <div class="flex flex-wrap gap-1.5">
          <span 
            v-for="tag in ensureArray(record.interesses)" 
            :key="tag"
            class="bg-primary/5 text-primary text-[9px] px-3 py-1.5 rounded-full border border-primary/10 font-black uppercase tracking-widest transition-all hover:bg-primary/10 cursor-default"
          >
            {{ tag }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item: record }">
        <div class="flex items-center justify-end gap-2 pr-2">
          <button 
            @click.stop="emits('edit', record)"
            class="p-2.5 rounded-xl text-text-light/10 dark:text-text-dark/10 hover:text-primary hover:bg-primary/10 hover:ring-1 hover:ring-primary/20 transition-all duration-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          
          <button 
            v-if="record.id"
            @click.stop="emits('delete', record.id!)"
            class="p-2.5 rounded-xl text-text-light/10 dark:text-text-dark/10 hover:text-danger hover:bg-danger/10 hover:ring-1 hover:ring-danger/20 transition-all duration-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 delay-75"
            title="Excluir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CrmEvasturDTO } from '~/../shared/types/CrmEvasturDTO'
import DataTable from '../DataTable.vue'
import type { ColumnDef } from '../DataTable.vue'

const props = defineProps<{
  records: CrmEvasturDTO[]
  loading?: boolean
  total?: number
  currentPage?: number
  totalPages?: number
}>()

const emits = defineEmits<{
  edit: [record: CrmEvasturDTO]
  delete: [id: number]
  changePage: [page: number]
  'row-click': [record: CrmEvasturDTO]
  search: [query: string]
}>()

const search = ref('')

let debounceTimer: any = null
watch(search, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emits('search', val)
  }, 400)
})

const columns: ColumnDef[] = [
  { key: 'contato', label: 'Contato', align: 'left', sortable: true },
  { key: 'localizacao', label: 'Localização / Social', align: 'left' },
  { key: 'contexto', label: 'Contexto', align: 'left' },
  { key: 'interesses', label: 'Interesses', align: 'left' },
  { key: 'actions', label: 'Ações', align: 'right' },
]

const getUrgencyClass = (urgency: string | null, isDot = false) => {
  const u = (urgency ?? '').toLowerCase()
  if (isDot) {
    if (u.includes('alta')) return 'bg-danger'
    if (u.includes('média') || u.includes('media')) return 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]'
    return 'bg-success'
  }
  
  if (u.includes('alta')) return 'bg-danger/10 text-danger ring-danger/30'
  if (u.includes('média') || u.includes('media')) return 'bg-warning/10 text-warning ring-warning/30'
  return 'bg-success/10 text-success ring-success/30'
}

const ensureArray = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return val.split(',').map(s => s.trim()).filter(s => !!s)
    }
  }
  return []
}
</script>
