<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '#imports'
import { useCrmAndreaRosaStore } from '~/stores/crmAndreaRosa'
import AndreaRosaHeader from '~/components/crm/AndreaRosaHeader.vue'
import AndreaRosaStats from '~/components/crm/AndreaRosaStats.vue'
import AndreaRosaTable from '~/components/crm/AndreaRosaTable.vue'
import AndreaRosaLeadModal from '~/components/crm/AndreaRosaLeadModal.vue'
import CrmDetailModal from '~/components/crm/CrmDetailModal.vue'

useHead({ title: 'CRM Andréa Rosa | Advocacia Previdenciária' })
import type { CrmAndreaRosaDTO } from '~/../shared/types/CrmAndreaRosaDTO'

const crmStore = useCrmAndreaRosaStore()

// Form Modal State
const isModalOpen = ref(false)
const selectedLead = ref<CrmAndreaRosaDTO | null>(null)

// Detail Modal State
const isDetailModalOpen = ref(false)
const selectedDetailContactId = ref<string | null>(null)

// Handlers
const openDetailModal = (record: CrmAndreaRosaDTO) => {
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

const openEditModal = (lead: CrmAndreaRosaDTO) => {
  selectedLead.value = { ...lead }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedLead.value = null
}

const handleModalSubmit = async (formData: Omit<CrmAndreaRosaDTO, 'id' | 'created_at'>) => {
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
    <AndreaRosaHeader 
      @add="openAddModal" 
    />

    <!-- Stats Overview -->
    <AndreaRosaStats 
      :stats="crmStore.stats"
      :loading="crmStore.statsLoading"
    />

    <!-- Main Table -->
    <AndreaRosaTable 
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
    <AndreaRosaLeadModal 
      :is-open="isModalOpen"
      :initial-data="selectedLead"
      :loading="crmStore.saving"
      @close="closeModal"
      @submit="handleModalSubmit"
    />
  </div>
</template>

