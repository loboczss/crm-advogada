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
      <template #header>
        <div class="px-8 py-5 border-b border-gray-100 dark:border-zinc-800/50 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white dark:bg-zinc-900/50">
          <div class="flex items-center gap-3">
            <Icon name="ph:users-three-bold" class="w-5 h-5 text-gray-400" />
            <div>
              <h2 class="text-base font-bold text-gray-900 dark:text-white leading-tight">Leads e Contatos</h2>
              <p class="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">Gestão de relacionamento</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="relative flex-1 lg:w-64">
              <input
                v-model="search"
                type="text"
                placeholder="Pesquisa rápida..."
                class="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 text-gray-900 dark:white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors shadow-sm"
              />
              <Icon name="ph:magnifying-glass-bold" class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div class="px-2.5 py-1 bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 whitespace-nowrap">
              <p class="text-[9px] font-bold text-gray-500 dark:text-zinc-400">
                {{ total }} TOTAL
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Cells -->

      <template #cell-contato="{ item: record }">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-md bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-zinc-700">
            <span class="text-xs font-semibold">{{ (record.nome ?? '?')[0]?.toUpperCase() }}</span>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
              {{ record.nome || 'Sem Nome' }}
            </p>
            <p class="text-[10px] text-gray-400 dark:text-zinc-500">
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
          <p v-if="record.nome_social" class="text-[10px] text-gray-400 font-medium lowercase">
            @{{ record.nome_social }}
          </p>
        </div>
      </template>

      <template #cell-contexto="{ item: record }">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-100 dark:border-zinc-800">
            <span class="w-1.5 h-1.5 rounded-full" :class="getUrgencyClass(record.urgencia, true)"></span>
            <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400">{{ record.urgencia || 'Média' }}</span>
          </div>
          
          <Icon 
            v-if="record.sentimento?.toLowerCase().includes('positivo')" 
            name="ph:smiley-bold" 
            class="w-4 h-4 text-emerald-500/60" 
          />
          <Icon 
            v-else-if="record.sentimento?.toLowerCase().includes('neutro')" 
            name="ph:minus-circle-bold" 
            class="w-4 h-4 text-amber-500/60" 
          />
          <Icon 
            v-else 
            name="ph:smiley-angry-bold" 
            class="w-4 h-4 text-rose-500/60" 
          />
        </div>
      </template>

      <template #cell-interesses="{ item: record }">
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="tag in ensureArray(record.interesses)" 
            :key="tag"
            class="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[9px] px-2 py-1 rounded-md border border-gray-100 dark:border-zinc-700 font-medium uppercase"
          >
            {{ tag }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item: record }">
        <div class="flex items-center justify-end gap-1.5 pr-2">
          <button 
            @click.stop="emits('edit', record)"
            class="p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Editar"
          >
            <Icon name="ph:pencil-simple-bold" class="w-3.5 h-3.5" />
          </button>
          
          <button 
            v-if="record.id"
            @click.stop="emits('delete', record.id!)"
            class="p-2 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Excluir"
          >
            <Icon name="ph:trash-bold" class="w-3.5 h-3.5" />
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
  if (u.includes('alta')) return 'bg-rose-500'
  if (u.includes('média') || u.includes('media')) return 'bg-amber-500'
  return 'bg-emerald-500'
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
