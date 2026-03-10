<template>
  <div class="space-y-4">
    <!-- Main Table Card -->
    <div class="bg-white dark:bg-background-dark/90 backdrop-blur-2xl rounded-3xl border border-border-light dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 overflow-hidden transition-all duration-500">
      
      <!-- Slot for custom header (like title, search, filters) -->
      <slot name="header"></slot>

      <!-- Loading State -->
      <div v-if="loading" class="p-12 space-y-6">
        <div v-for="n in 5" :key="n" class="flex gap-4 items-center">
          <div class="w-12 h-12 rounded-2xl bg-surface-light dark:bg-surface-dark animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-surface-light dark:bg-surface-dark rounded-full animate-pulse w-1/3" />
            <div class="h-3 bg-surface-light/50 dark:bg-surface-dark/50 rounded-full animate-pulse w-1/4" />
          </div>
          <div class="w-24 h-8 rounded-xl bg-surface-light dark:bg-surface-dark animate-pulse" />
        </div>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-surface-light/50 dark:bg-background-dark/30 border-b border-border-light dark:border-white/5">
              <!-- Dynamically render columns -->
              <th 
                v-for="(col, index) in columns" 
                :key="col.key"
                class="px-6 py-6 select-none transition-all duration-300"
                :class="[
                  index === 0 ? 'pl-8' : '',
                  index === columns.length - 1 ? 'pr-8' : ''
                ]"
                @click="col.sortable ? emit('sort', col.key) : null"
              >
                <div 
                  class="flex flex-col gap-2"
                  :class="{
                    'items-start': !col.align || col.align === 'left',
                    'items-center': col.align === 'center',
                    'items-end': col.align === 'right'
                  }"
                >
                  <div 
                    class="flex items-center gap-2.5 group/h"
                    :class="col.sortable ? 'cursor-pointer' : ''"
                  >
                    <span class="text-[10px] font-black uppercase tracking-[0.15em] text-text-light/40 dark:text-text-dark/30 group-hover/h:text-primary transition-all duration-300">
                      {{ col.label }}
                    </span>
                    
                    <!-- Sorting Icon -->
                    <div v-if="col.sortable && currentSort === col.key" class="text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 transition-transform duration-500" :class="sortOrder === 'asc' ? '' : 'rotate-180'">
                        <path fill-rule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clip-rule="evenodd" />
                      </svg>
                    </div>

                    <!-- Filter Button -->
                    <button
                      v-if="col.filterable"
                      class="p-1.5 rounded-lg transition-all duration-300"
                      :class="openFilter === col.key || columnFilters[col.key] ? 'text-primary bg-primary/10 ring-1 ring-primary/20 shadow-glow-primary' : 'text-text-light/20 hover:text-primary/40 dark:text-text-dark/10 dark:hover:text-primary/40'"
                      @click.stop="toggleFilter(col.key)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </button>
                  </div>

                  <!-- Filter Input Dropdown -->
                  <div 
                    v-if="col.filterable && openFilter === col.key"
                    class="w-full max-w-[150px] animate-in fade-in slide-in-from-top-2 duration-300 ease-out z-10"
                    @click.stop
                  >
                    <input
                      type="text"
                      :value="columnFilters[col.key] || ''"
                      placeholder="Buscar..."
                      class="w-full bg-white dark:bg-background-dark border-none ring-1 ring-border-light dark:ring-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-text-light dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none shadow-2xl shadow-primary/20"
                      autofocus
                      @input="handleFilterInput(col.key, $event)"
                      @keydown.enter="submitFilter(col.key)"
                      @blur="submitFilter(col.key)"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          
          <TransitionGroup name="list" tag="tbody" class="divide-y divide-border-light/50 dark:divide-white/5 relative">
            <tr
              v-for="item in data"
              :key="item[keyField] as string | number"
              class="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04] cursor-pointer transition-all duration-300 relative z-10 bg-white dark:bg-transparent"
              @click="emit('row-click', item)"
            >
              <td 
                v-for="(col, index) in columns" 
                :key="col.key"
                class="px-6 py-5"
                :class="[
                  index === 0 ? 'px-8' : '',
                  index === columns.length - 1 ? 'pr-8' : '',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                ]"
              >
                <!-- Cell Data Slot -->
                <slot :name="`cell-${col.key}`" :item="item" :column="col">
                  {{ item[col.key] }}
                </slot>
              </td>
            </tr>
            
            <tr v-if="data.length === 0" key="empty" class="w-full">
              <td :colspan="columns.length" class="px-8 py-32 text-center bg-surface-light/20 dark:bg-transparent">
                <div class="flex flex-col items-center justify-center space-y-4">
                  <div class="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-primary/10">🗄️</div>
                  <div>
                    <p class="text-lg font-black text-text-light dark:text-white">Nenhum registro encontrado</p>
                    <p class="text-sm text-text-light/40 dark:text-text-dark/40 font-bold uppercase tracking-widest mt-1">Ajuste seus filtros para buscar novamente</p>
                  </div>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="px-8 py-7 bg-surface-light/30 dark:bg-white/5 border-t border-border-light dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p class="text-[10px] font-black text-text-light/30 dark:text-text-dark/20 uppercase tracking-[0.3em]">
          Mostrando <span class="text-text-light dark:text-primary">{{ rangeStart }}—{{ rangeEnd }}</span> de {{ total }} resultados
        </p>

        <div class="flex items-center gap-2">
          <button
            @click="emit('page-change', 1)"
            :disabled="currentPage === 1 || loading"
            class="w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-background-dark border border-border-light dark:border-white/10 text-text-light/60 dark:text-text-dark/60 disabled:opacity-20 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
            </svg>
          </button>
          
          <div class="flex items-center gap-2 mx-2">
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="w-8 text-center text-text-light/20 font-black">···</span>
              <button
                v-else
                @click="emit('page-change', p as number)"
                :class="p === currentPage ? 'bg-primary text-white shadow-xl shadow-primary/40 ring-4 ring-primary/10 scale-110' : 'bg-white dark:bg-background-dark border border-border-light dark:border-white/10 text-text-light/60 dark:text-text-dark/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20'"
                class="w-11 h-11 flex items-center justify-center rounded-2xl text-[11px] font-black transition-all duration-300"
              >
                {{ p }}
              </button>
            </template>
          </div>

          <button
            @click="emit('page-change', totalPages)"
            :disabled="currentPage === totalPages || loading"
            class="w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-background-dark border border-border-light dark:border-white/10 text-text-light/60 dark:text-text-dark/60 disabled:opacity-20 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface ColumnDef {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
}

interface Props {
  columns: ColumnDef[]
  data: any[]
  keyField?: string
  loading?: boolean
  total?: number
  currentPage?: number
  totalPages?: number
  pageSize?: number
  currentSort?: string
  sortOrder?: 'asc' | 'desc'
  columnFilters?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  keyField: 'id',
  loading: false,
  total: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 25,
  columnFilters: () => ({})
})

const emit = defineEmits<{
  'page-change': [page: number]
  'sort': [field: string]
  'column-filter': [column: string, value: string]
  'row-click': [item: any]
}>()

// Filter Dropdown state
const openFilter = ref<string | null>(null)
const tempFilterValues = ref<Record<string, string>>({})

const toggleFilter = (key: string) => {
  if (openFilter.value === key) {
    openFilter.value = null
  } else {
    openFilter.value = key
    tempFilterValues.value[key] = props.columnFilters[key] || ''
  }
}

const handleFilterInput = (key: string, e: Event) => {
  tempFilterValues.value[key] = (e.target as HTMLInputElement).value
}

const submitFilter = (key: string) => {
  emit('column-filter', key, tempFilterValues.value[key] || '')
  openFilter.value = null
}

const rangeStart = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const rangeEnd = computed(() => Math.min(props.currentPage * props.pageSize, props.total))

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})
</script>
