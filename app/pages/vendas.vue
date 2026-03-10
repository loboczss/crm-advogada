<template>
  <NuxtLayout>
    <div id="vendas-page" class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        <!-- Page Header -->
        <SalesHeader @open-modal="isModalOpen = true" />

        <!-- Error Banner -->
        <div
          v-if="store.error"
          class="px-5 py-4 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary dark:text-red-400 text-sm font-semibold"
        >
          {{ store.error }}
        </div>

        <!-- Stats Cards -->
        <SalesStats
          :total-vendas="store.statsTotal"
          :valor-total="store.statsValorTotal"
          :ticket-medio="store.statsTicketMedio"
          :maior-venda="store.statsMaiorVenda"
          :loading="store.loading || store.statsLoading"
        />

        <!-- Filters -->
        <SalesFilters @change="handleFilterChange" />

        <!-- Sales Table -->
        <SalesTable
          :vendas="store.vendas"
          :loading="store.loading"
          :deleting="store.deleting"
          :total="store.total"
          :current-page="store.currentPage"
          :total-pages="store.totalPages"
          :page-size="store.pageSize"
          :sort-by="store.sortBy"
          :sort-order="store.sortOrder"
          :column-filters="store.columnFilters"
          @delete="handleDelete"
          @page-change="store.goToPage"
          @sort="store.setSort"
          @column-filter="store.setColumnFilter"
          @row-click="store.openDetail"
        />
      </div>

      <!-- Detail Modal -->
      <SalesDetailModal
        :is-open="store.isDetailModalOpen"
        :venda="store.selectedVenda"
        @close="store.closeDetail"
        @update-success="handleUpdateSuccess"
        @update-error="handleUpdateError"
      />

      <!-- Add Modal -->
      <SalesAddModal
        :is-open="isModalOpen"
        :saving="store.saving"
        @close="isModalOpen = false"
        @add="handleAdd"
      />

      <!-- Alert -->
      <div class="fixed bottom-6 right-6 z-[300] w-full max-w-md pointer-events-none">
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="translate-y-10 opacity-0 sm:translate-y-0 sm:translate-x-10"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-10"
        >
          <div v-if="showAlert" class="pointer-events-auto">
            <Alert
              :type="alertType"
              :title="alertTitle"
              @close="showAlert = false"
            >
              {{ alertMessage }}
            </Alert>
          </div>
        </Transition>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '#imports'
import SalesHeader from '../components/sales/SalesHeader.vue'
import SalesStats from '../components/sales/SalesStats.vue'
import SalesTable from '../components/sales/SalesTable.vue'
import SalesDetailModal from '../components/sales/SalesDetailModal.vue'
import SalesAddModal from '../components/sales/SalesAddModal.vue'
import SalesFilters from '../components/sales/SalesFilters.vue'
import Alert from '../components/Alert.vue'
import { useVendasStore } from '../stores/vendas'
import type { Venda } from '../../shared/types/VendaDTO'
import type { SalesFilterParams } from '../components/sales/SalesFilters.vue'

useHead({ title: 'Histórico de Vendas | Evastur' })
definePageMeta({ middleware: ['auth'] })

const store = useVendasStore()
const isModalOpen = ref(false)

const showAlert = ref(false)
const alertType = ref<'success' | 'danger' | 'warning' | 'info'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

onMounted(async () => {
  await Promise.all([store.fetchVendas(), store.fetchStats()])
})

async function handleFilterChange(params: SalesFilterParams) {
  await store.applyFilters(params)
}

async function handleAdd(payload: Omit<Venda, 'id' | 'created_at'>) {
  try {
    await store.addVenda(payload)
    isModalOpen.value = false
    
    alertType.value = 'success'
    alertTitle.value = 'Venda Adicionada'
    alertMessage.value = 'A nova venda foi cadastrada com sucesso.'
    showAlert.value = true
    
    setTimeout(() => {
      showAlert.value = false
    }, 4000)
  } catch (error) {
    alertType.value = 'danger'
    alertTitle.value = 'Erro ao Salvar'
    alertMessage.value = 'Ocorreu um problema ao tentar salvar a nova venda.'
    showAlert.value = true
    
    setTimeout(() => {
      showAlert.value = false
    }, 4000)
  }
}

async function handleDelete(id: number) {
  try {
    await store.deleteVenda(id)
    alertType.value = 'success'
    alertTitle.value = 'Venda Excluída'
    alertMessage.value = 'A venda foi removida do sistema com sucesso.'
    showAlert.value = true
    
    setTimeout(() => {
      showAlert.value = false
    }, 4000)
  } catch (error) {
    alertType.value = 'danger'
    alertTitle.value = 'Erro ao Excluir'
    alertMessage.value = 'Ocorreu um problema ao tentar excluir esta venda.'
    showAlert.value = true
    
    setTimeout(() => {
      showAlert.value = false
    }, 4000)
  }
}

function handleUpdateSuccess() {
  alertType.value = 'success'
  alertTitle.value = 'Venda Atualizada'
  alertMessage.value = 'Os dados da venda foram atualizados com sucesso.'
  showAlert.value = true
  
  setTimeout(() => {
    showAlert.value = false
  }, 4000)
}

function handleUpdateError() {
  alertType.value = 'danger'
  alertTitle.value = 'Erro ao Atualizar'
  alertMessage.value = 'Ocorreu um problema ao tentar atualizar os dados da venda.'
  showAlert.value = true
  
  setTimeout(() => {
    showAlert.value = false
  }, 4000)
}
</script>
