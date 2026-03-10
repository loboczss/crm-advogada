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
            <div class="p-3 bg-blue-500/10 rounded-2xl shadow-sm">
              <Icon name="ph:users-three-duotone" class="w-5 h-5 text-blue-500" />
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
              <Icon name="ph:magnifying-glass-bold" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
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
          <p class="text-xs font-bold text-slate-500 dark:text-gray-400 tracking-tight flex items-center gap-2">
            <Icon name="ph:map-pin-bold" class="w-3.5 h-3.5" />
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
          <Icon 
            v-if="record.sentimento?.toLowerCase().includes('positivo')" 
            name="ph:smiley-bold" 
            class="w-5 h-5 text-emerald-500" 
          />
          <Icon 
            v-else-if="record.sentimento?.toLowerCase().includes('neutro')" 
            name="ph:minus-circle-bold" 
            class="w-5 h-5 text-amber-500" 
          />
          <Icon 
            v-else 
            name="ph:smiley-angry-bold" 
            class="w-5 h-5 text-rose-500" 
          />
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
            class="p-2.5 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
            title="Editar"
          >
            <Icon name="ph:pencil-simple-bold" class="w-4 h-4" />
          </button>
          
          <button 
            v-if="record.id"
            @click.stop="emits('delete', record.id!)"
            class="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 delay-75"
            title="Excluir"
          >
            <Icon name="ph:trash-bold" class="w-4 h-4" />
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
