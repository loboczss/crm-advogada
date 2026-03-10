<template>
  <div id="sales-filters" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <p class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Filtros</p>
      <button
        v-if="hasActiveFilters"
        id="btn-clear-filters"
        @click="clearFilters"
        class="text-xs font-bold text-secondary hover:underline transition-colors"
      >
        Limpar filtros
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Date Range -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Data inicial</label>
        <input
          id="filter-start-date"
          v-model="filters.startDate"
          type="date"
          class="filter-input"
          @change="emit('change', toQueryParams())"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Data final</label>
        <input
          id="filter-end-date"
          v-model="filters.endDate"
          type="date"
          class="filter-input"
          @change="emit('change', toQueryParams())"
        />
      </div>

      <!-- Value Mode Selector -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Filtro por valor</label>
        <select id="filter-valor-modo" v-model="filters.valorModo" class="filter-input" @change="resetValueInputs">
          <option value="">Sem filtro</option>
          <option value="exato">Valor exato</option>
          <option value="aprox">Valor aproximado (±10%)</option>
          <option value="min">Valor mínimo</option>
          <option value="max">Valor máximo</option>
          <option value="range">Faixa de valor</option>
        </select>
      </div>

      <!-- Dynamic Value Inputs -->
      <div class="flex flex-col gap-1.5">
        <template v-if="filters.valorModo === 'exato'">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Valor exato (R$)</label>
          <input id="filter-valor-exato" v-model.number="filters.valorExato" type="number" step="0.01" placeholder="Ex: 2500.00" class="filter-input" @change="emit('change', toQueryParams())" />
        </template>
        <template v-else-if="filters.valorModo === 'aprox'">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Valor aproximado (R$)</label>
          <input id="filter-valor-aprox" v-model.number="filters.valorAprox" type="number" step="0.01" placeholder="Ex: 3000.00" class="filter-input" @change="emit('change', toQueryParams())" />
        </template>
        <template v-else-if="filters.valorModo === 'min'">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Valor mínimo (R$)</label>
          <input id="filter-valor-min" v-model.number="filters.valorMin" type="number" step="0.01" placeholder="Ex: 1000.00" class="filter-input" @change="emit('change', toQueryParams())" />
        </template>
        <template v-else-if="filters.valorModo === 'max'">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Valor máximo (R$)</label>
          <input id="filter-valor-max" v-model.number="filters.valorMax" type="number" step="0.01" placeholder="Ex: 10000.00" class="filter-input" @change="emit('change', toQueryParams())" />
        </template>
        <template v-else-if="filters.valorModo === 'range'">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Faixa (Min – Max, R$)</label>
          <div class="flex gap-2">
            <input id="filter-range-min" v-model.number="filters.valorMin" type="number" step="0.01" placeholder="Min" class="filter-input" @change="emit('change', toQueryParams())" />
            <input id="filter-range-max" v-model.number="filters.valorMax" type="number" step="0.01" placeholder="Max" class="filter-input" @change="emit('change', toQueryParams())" />
          </div>
        </template>
        <template v-else>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 invisible">Valor</label>
          <div class="filter-input bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-gray-600 cursor-default select-none text-xs flex items-center justify-center">
            Nenhum filtro de valor
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

export interface SalesFilterParams {
  startDate?: string
  endDate?: string
  valorMin?: number
  valorMax?: number
  valorExato?: number
  valorAprox?: number
}

const emit = defineEmits<{ change: [params: SalesFilterParams] }>()

const filters = reactive({
  startDate: '',
  endDate: '',
  valorModo: '' as '' | 'exato' | 'aprox' | 'min' | 'max' | 'range',
  valorExato: null as number | null,
  valorAprox: null as number | null,
  valorMin: null as number | null,
  valorMax: null as number | null,
})

const hasActiveFilters = computed(() =>
  !!(filters.startDate || filters.endDate || filters.valorModo)
)

function resetValueInputs() {
  filters.valorExato = null
  filters.valorAprox = null
  filters.valorMin = null
  filters.valorMax = null
  emit('change', toQueryParams())
}

function toQueryParams(): SalesFilterParams {
  const params: SalesFilterParams = {}
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  if (filters.valorModo === 'exato' && filters.valorExato != null) params.valorExato = filters.valorExato
  if (filters.valorModo === 'aprox' && filters.valorAprox != null) params.valorAprox = filters.valorAprox
  if (filters.valorModo === 'min' && filters.valorMin != null) params.valorMin = filters.valorMin
  if (filters.valorModo === 'max' && filters.valorMax != null) params.valorMax = filters.valorMax
  if (filters.valorModo === 'range') {
    if (filters.valorMin != null) params.valorMin = filters.valorMin
    if (filters.valorMax != null) params.valorMax = filters.valorMax
  }
  return params
}

function clearFilters() {
  filters.startDate = ''
  filters.endDate = ''
  filters.valorModo = ''
  filters.valorExato = null
  filters.valorAprox = null
  filters.valorMin = null
  filters.valorMax = null
  emit('change', {})
}
</script>

<style scoped>
.filter-input {
  @apply w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition;
}
</style>
