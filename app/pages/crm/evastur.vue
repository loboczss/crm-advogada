<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '#imports'
import { useCrmEvasturStore } from '~/stores/crmEvastur'

useHead({ title: 'CRM Evastur | Evastur' })
import type { CrmEvasturDTO } from '~/../shared/types/CrmEvasturDTO'

const crmStore = useCrmEvasturStore()

// Form Modal State
const isModalOpen = ref(false)
const selectedLead = ref<CrmEvasturDTO | null>(null)

// Detail Modal State
const isDetailModalOpen = ref(false)
const selectedDetailContactId = ref<string | null>(null)

// Handlers
const openDetailModal = (record: CrmEvasturDTO) => {
  selectedDetailContactId.value = record.contato_id || null
  isDetailModalOpen.value = true
}

const closeDetailModal = () => {
  isDetailModalOpen.value = false
  setTimeout(() => { selectedDetailContactId.value = null }, 300)
}

const openAddModal = () => {
  selectedLead.value = null
  isModalOpen.value = true
}

const openEditModal = (lead: CrmEvasturDTO) => {
  selectedLead.value = { ...lead }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedLead.value = null
}

const handleModalSubmit = async (formData: Omit<CrmEvasturDTO, 'id' | 'created_at'>) => {
  try {
    if (selectedLead.value?.id) {
      await crmStore.updateRecord(selectedLead.value.id, formData)
    } else {
      await crmStore.addRecord(formData)
    }
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar lead:', error)
  }
}

const handleDeleteLead = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir este lead?')) {
    try {
      await crmStore.deleteRecord(id)
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
    }
  }
}

onMounted(() => {
  crmStore.fetchRecords()
  crmStore.fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Search and Add -->
    <CrmEvasturHeader 
      @add="openAddModal" 
    />

    <!-- Stats Overview -->
    <CrmEvasturStats 
      :stats="crmStore.stats"
      :loading="crmStore.statsLoading"
    />

    <!-- Main Table -->
    <CrmEvasturTable 
      :records="crmStore.records" 
      :loading="crmStore.loading"
      :total="crmStore.total"
      :current-page="crmStore.currentPage"
      :total-pages="crmStore.totalPages"
      @edit="openEditModal" 
      @delete="handleDeleteLead"
      @change-page="crmStore.goToPage"
      @row-click="openDetailModal"
      @search="crmStore.setSearch"
    />

    <!-- Detail Modal -->
    <CrmDetailModal
      :is-open="isDetailModalOpen"
      :contato-id="selectedDetailContactId"
      @close="closeDetailModal"
    />

    <!-- Lead Form Modal -->
    <CrmEvasturLeadModal 
      :is-open="isModalOpen"
      :initial-data="selectedLead"
      :loading="crmStore.saving"
      @close="closeModal"
      @submit="handleModalSubmit"
    />
  </div>
</template>
