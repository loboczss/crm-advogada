<template>
  <Modal
    :is-open="isOpen"
    title="Nova Venda"
    description="Preencha os dados para registrar uma venda."
    :loading="saving"
    max-width="lg"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
        
        <!-- Group: Cliente & Vendedor -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Informações Principais</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Nome do Contato</label>
              <input v-model="form.contact_name" type="text" placeholder="João da Silva" class="input-field" required />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Contato ID</label>
              <input v-model="form.contato_id" type="text" placeholder="CTT-001" class="input-field" required />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Vendedor</label>
              <input v-model="form.vendedor" type="text" placeholder="Nome do vendedor" class="input-field" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Vendedor ID</label>
              <input v-model="form.vendedor_id" type="text" placeholder="ID do vendedor" class="input-field" />
            </div>
          </div>
        </div>

        <!-- Group: Financeiro & Status -->
        <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Financeiro e Status</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Valor da Venda (R$)</label>
              <input v-model.number="form.valor_venda" type="number" step="0.01" placeholder="0.00" class="input-field" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Comissão (R$)</label>
              <input v-model.number="form.comissao" type="number" step="0.01" placeholder="0.00" class="input-field" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Status</label>
              <select v-model="form.status" class="input-field">
                <option value="">Selecionar...</option>
                <option value="PENDENTE">PENDENTE</option>
                <option value="EM PROCESSO">EM PROCESSO</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="CONFIRMADO">CONFIRMADO</option>
                <option value="EMITIDA">EMITIDA</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Tipo de Venda</label>
              <input v-model="form.tipo_venda" type="text" placeholder="Pacote, Avulso..." class="input-field" />
            </div>

            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Forma de Pagamento</label>
              <input v-model="form.forma_pagamento" type="text" placeholder="PIX, Cartão..." class="input-field" />
            </div>
          </div>
        </div>

        <!-- Group: Logística -->
        <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Logística</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Data de Embarque</label>
              <input v-model="form.embarque" type="date" class="input-field" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Previsão de Volta</label>
              <input v-model="form.data_volta" type="date" class="input-field" />
            </div>
          </div>
        </div>

        <!-- Group: Observações -->
        <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Observações</h4>
          <div class="space-y-1.5">
            <textarea v-model="form.observacao" rows="3" class="input-field resize-none leading-relaxed" placeholder="Anotações adicionais..."></textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800/50">
        <button
          type="button"
          @click="handleClose"
          :disabled="saving"
          class="w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus:ring-2 focus:ring-gray-200 outline-none text-sm disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:ring-2 focus:ring-primary/50 outline-none flex items-center justify-center gap-2 min-w-[120px] text-sm"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ saving ? 'Salvando...' : 'Salvar Venda' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import Modal from '../Modal.vue'
import type { Venda } from '../../../shared/types/VendaDTO'

interface Props {
  isOpen: boolean
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), { saving: false })
const emit = defineEmits<{ close: []; add: [venda: Omit<Venda, 'id' | 'created_at'>] }>()

const form = reactive<Omit<Venda, 'id' | 'created_at'>>({
  contato_id: '',
  contact_name: '',
  vendedor: '',
  valor_venda: null,
  status: '',
  tipo_venda: '',
  forma_pagamento: '',
  embarque: '',
  data_volta: '',
  comissao: null,
  observacao: '',
  vendedor_id: null,
})

function resetForm() {
  Object.assign(form, {
    contato_id: '', contact_name: '', vendedor: '', valor_venda: null, status: '',
    tipo_venda: '', forma_pagamento: '', embarque: '', data_volta: '', comissao: null,
    observacao: '', vendedor_id: null,
  })
}

watch(() => props.isOpen, (val) => {
  if (val) {
    resetForm()
  }
})

function handleSubmit() {
  const payload = { ...form }
  // Garantir que campos de data vazios sejam enviados como nulos
  if (payload.embarque === '') payload.embarque = null
  if (payload.data_volta === '') payload.data_volta = null

  emit('add', payload)
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-200 dark:bg-zinc-700 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300 dark:bg-zinc-600;
}

.input-field {
  @apply w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-colors shadow-sm;
}
</style>
