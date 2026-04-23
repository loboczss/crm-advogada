<template>
  <Modal
    :is-open="isOpen"
    :loading="saving"
    max-width="lg"
    @close="handleClose"
  >
    <template #title>
      {{ isEditing ? 'Editar Atendimento' : 'Detalhes do Atendimento' }}
    </template>
    
    <template #description>
      ID: #{{ venda?.id }}
    </template>

    <template #header-actions>
      <button
        v-if="!isEditing"
        @click="startEditing"
        class="p-2 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
        title="Editar informações"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      </button>
    </template>

    <div v-if="venda" class="space-y-6">
      <!-- Group: Cliente & Consultor -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Informações Principais</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Nome do Contato</label>
            <input v-if="isEditing" v-model="editForm.contact_name" class="input-field" />
            <p v-else class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ venda.contact_name || '-' }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Contato ID</label>
            <input v-if="isEditing" v-model="editForm.contato_id" class="input-field opacity-50 cursor-not-allowed" disabled title="Não é possível alterar o ID do contato" />
            <p v-else class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ venda.contato_id || '-' }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Consultor</label>
            <input v-if="isEditing" v-model="editForm.vendedor" class="input-field" />
            <p v-else class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ venda.vendedor || '-' }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">ID do Consultor</label>
            <input v-if="isEditing" v-model="editForm.vendedor_id" class="input-field" />
            <p v-else class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ venda.vendedor_id || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Group: Honorários & Status -->
      <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Honorários e Status</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Valor do Contrato</label>
            <input v-if="isEditing" v-model.number="editForm.valor_venda" type="number" step="0.01" class="input-field" />
            <p v-else class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(venda.valor_venda) }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Comissão</label>
            <input v-if="isEditing" v-model.number="editForm.comissao" type="number" step="0.01" class="input-field" />
            <p v-else class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(venda.comissao) }}</p>
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Status</label>
            <select v-if="isEditing" v-model="editForm.status" class="input-field">
              <option value="PENDENTE">PENDENTE</option>
              <option value="CONFIRMADO">CONFIRMADO</option>
              <option value="EM PROCESSO">EM PROCESSO</option>
              <option value="CANCELADO">CANCELADO</option>
              <option value="EMITIDA">EMITIDA</option>
            </select>
            <div v-else>
              <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset" :class="statusStyles(venda.status)">
                {{ venda.status || 'PENDENTE' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Group: Prazos -->
      <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Prazos e Agendamentos</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Data do Protocolo</label>
            <input v-if="isEditing" v-model="editForm.embarque" type="date" class="input-field" />
            <p v-else class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(venda.embarque) }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-500 dark:text-zinc-400">Previsão de Conclusão</label>
            <input v-if="isEditing" v-model="editForm.data_volta" type="date" class="input-field" />
            <p v-else class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(venda.data_volta) }}</p>
          </div>
        </div>
      </div>

      <!-- Group: Observações -->
      <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Observações</h4>
        <div class="space-y-1.5">
          <textarea v-if="isEditing" v-model="editForm.observacao" rows="3" class="input-field resize-none leading-relaxed" placeholder="Adicione notas sobre este atendimento..."></textarea>
          <p v-else class="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-md border border-gray-100 dark:border-zinc-800/50 min-h-[3rem]">
            {{ venda.observacao || 'Nenhuma observação registrada.' }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 w-full">
        <template v-if="!isEditing">
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mr-auto hidden sm:inline-block">
            Criado em: {{ formatDate(venda?.created_at) }}
          </span>
          <Button
            variant="outline"
            @click="handleClose"
            class="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </template>
        <template v-else>
          <Button
            variant="outline"
            @click="cancelEditing"
            class="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            @click="saveChanges"
            :loading="saving"
            icon="ph:check-bold"
            class="w-full sm:w-auto px-8"
          >
            Salvar Alterações
          </Button>
        </template>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Modal from '../Modal.vue'
import type { Venda } from '../../../shared/types/VendaDTO'
import { useVendasStore } from '../../stores/vendas'

const props = defineProps<{
  isOpen: boolean
  venda: Venda | null
}>()

const emit = defineEmits<{
  close: []
  'update-success': []
  'update-error': []
}>()

const store = useVendasStore()

const isEditing = ref(false)
const saving = ref(false)
const editForm = reactive<Partial<Venda>>({})

watch(() => props.isOpen, (val) => {
  if (!val) {
    isEditing.value = false
  }
})

function startEditing() {
  if (props.venda) {
    const extractDate = (val: string | null | undefined) => {
      if (!val) return null
      try {
        const d = new Date(val)
        if (isNaN(d.getTime())) return null
        return d.toISOString().split('T')[0]
      } catch {
        return null
      }
    }

    Object.assign(editForm, {
      contato_id: props.venda.contato_id,
      contact_name: props.venda.contact_name,
      vendedor: props.venda.vendedor,
      vendedor_id: props.venda.vendedor_id,
      valor_venda: props.venda.valor_venda,
      comissao: props.venda.comissao,
      status: props.venda.status,
      embarque: extractDate(props.venda.embarque),
      data_volta: extractDate(props.venda.data_volta),
      observacao: props.venda.observacao
    })
    isEditing.value = true
  }
}

function cancelEditing() {
  isEditing.value = false
}

async function saveChanges() {
  if (!props.venda) return
  saving.value = true
  try {
    const payload = { ...editForm }
    if (payload.embarque === '') payload.embarque = null
    if (payload.data_volta === '') payload.data_volta = null
    
    await store.updateVenda(props.venda.id, payload)
    
    isEditing.value = false
    emit('update-success')
  } catch (err) {
    console.error('Erro ao salvar alteracoes:', err)
    emit('update-error')
  } finally {
    saving.value = false
  }
}

function handleClose() {
  if (isEditing.value) {
    if (!confirm('Existem alterações não salvas. Deseja mesmo fechar?')) {
      return
    }
  }
  emit('close')
}

const formatCurrency = (val: number | null | undefined) => {
  if (val == null) return '-'
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  } catch {
    return '-'
  }
}

const statusStyles = (status: string | null | undefined): string => {
  const s = String(status || '').toUpperCase()
  switch (s) {
    case 'CONFIRMADO':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400'
    case 'EMITIDA':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400'
    case 'PENDENTE':
    case 'EM PROCESSO':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400'
    case 'CANCELADO':
      return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400'
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-zinc-800 dark:text-zinc-300'
  }
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
  @apply w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-colors shadow-sm;
}
</style>
