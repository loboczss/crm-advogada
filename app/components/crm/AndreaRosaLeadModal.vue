<template>
  <Modal
    :is-open="isOpen"
    :title="isEdit ? 'Editar Lead' : 'Novo Lead'"
    :description="isEdit ? 'Atualize as informações do contato abaixo.' : 'Preencha os dados básicos para iniciar o atendimento jurídico.'"
    :loading="loading"
    max-width="3xl"
    @close="emit('close')"
  >
    <!-- Modal Body -->
    <form id="lead-form" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Info Section -->
        <div class="md:col-span-2 flex items-center gap-2 mb-2">
          <div class="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600">Informações Básicas</span>
          <div class="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Nome Completo</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Icon name="ph:user-bold" size="18" />
            </span>
            <input v-model="form.nome" type="text" placeholder="Ex: João Silva" class="modal-input" style="padding-left: 3.5rem !important;" required />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">ID do Contato (ID único)</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Icon name="ph:identification-card-bold" size="18" />
            </span>
            <input v-model="form.contato_id" type="text" placeholder="Ex: CTT-001" class="modal-input" style="padding-left: 3.5rem !important;" :disabled="isEdit" required />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">E-mail</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Icon name="ph:envelope-simple-bold" size="18" />
            </span>
            <input v-model="form.email" type="email" placeholder="email@exemplo.com" class="modal-input" style="padding-left: 3.5rem !important;" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Cidade</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Icon name="ph:map-pin-bold" size="18" />
            </span>
            <input v-model="form.cidade" type="text" placeholder="Cidade / UF" class="modal-input" style="padding-left: 3.5rem !important;" />
          </div>
        </div>

        <!-- Context Section -->
        <div class="md:col-span-2 flex items-center gap-2 mt-4 mb-2">
          <div class="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600">Contexto Previdenciário</span>
          <div class="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Sentimento / Urgência</label>
          <div class="relative group">
            <select v-model="form.sentimento" class="modal-input appearance-none" style="padding-left: 3.5rem !important;">
              <option value="">Selecionar Sentimento...</option>
              <option value="Positivo">😊 Positivo</option>
              <option value="Neutro">😐 Neutro</option>
              <option value="Negativo">😡 Negativo</option>
            </select>
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400">
              <Icon name="ph:heart-bold" size="18" />
            </span>
            <span class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <Icon name="ph:caret-down-bold" size="12" />
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Nível de Prioridade</label>
          <div class="relative group">
            <select v-model="form.urgencia" class="modal-input appearance-none" style="padding-left: 3.5rem !important;">
              <option value="">Selecionar Prioridade...</option>
              <option value="Alta">🔥 Alta (Urgente)</option>
              <option value="Média">⚡ Média</option>
              <option value="Baixa">☁️ Baixa</option>
            </select>
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400">
              <Icon name="ph:lightning-bold" size="18" />
            </span>
            <span class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <Icon name="ph:caret-down-bold" size="12" />
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Tipo de Benefício / Serviço</label>
          <input v-model="form.fase_obra" type="text" placeholder="Ex: Aposentadoria, BPC, Revisão..." class="modal-input" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Data de Nascimento</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Icon name="ph:calendar-bold" size="18" />
            </span>
            <input v-model="form.data_nascimento" type="date" placeholder="AAAA-MM-DD" class="modal-input" style="padding-left: 3.5rem !important;" />
          </div>
        </div>

        <div class="md:col-span-2 space-y-4 mt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Patologias / Condições</label>
              <div class="relative group">
                <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Icon name="ph:tag-bold" size="16" />
                </span>
                <input 
                  v-model="interessesRaw" 
                  type="text" 
                  placeholder="Ex: Fibromialgia, Deficiência..." 
                  class="modal-input" 
                  style="padding-left: 3.5rem !important;"
                />
              </div>
              <p class="text-[10px] text-gray-400 ml-1">Separe por vírgulas.</p>
            </div>
            
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Objeções / Dificuldades</label>
              <div class="relative group">
                <span class="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 group-focus-within:text-danger transition-colors">
                  <Icon name="ph:warning-circle-bold" size="16" />
                </span>
                <input 
                  v-model="objeccoesRaw" 
                  type="text" 
                  placeholder="Ex: Documentação, Renda..." 
                  class="modal-input" 
                  style="padding-left: 3.5rem !important;"
                />
              </div>
              <p class="text-[10px] text-gray-400 ml-1">Separe por vírgulas.</p>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold text-gray-600 dark:text-zinc-400 ml-1">Resumo do Caso / Perfil</label>
            <textarea 
              v-model="form.resumo_perfil" 
              rows="3" 
              placeholder="Descreva detalhes importantes do histórico previdenciário do cliente..." 
              class="modal-input resize-none h-28"
            ></textarea>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
        <Button
          variant="outline"
          @click="emit('close')"
          class="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          form="lead-form"
          type="submit"
          variant="primary"
          :loading="loading"
          :icon="isEdit ? 'ph:check-bold' : 'ph:plus-bold'"
          class="w-full sm:w-auto px-8"
        >
          {{ isEdit ? 'Salvar Alterações' : 'Criar Lead' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import Modal from '../Modal.vue'
import Button from '../Button.vue'

import type { CrmAndreaRosaDTO } from '../../../shared/types/CrmAndreaRosaDTO'

interface Props {
  isOpen: boolean
  initialData?: CrmAndreaRosaDTO | null
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [data: Omit<CrmAndreaRosaDTO, 'id' | 'created_at'>]
}>()

const isEdit = computed(() => !!props.initialData)

// Initialize form with defaults
const formDefault: CrmAndreaRosaDTO = {
  contato_id: '',
  nome: '',
  cidade: '',
  email: '',
  data_nascimento: '',
  sentimento: '',
  urgencia: '',
  resumo_perfil: '',
  interesses: [],
  objeccoes: [],
  fase_obra: '',
  nome_social: '',
  compras_cliente: []
}

const form = reactive<CrmAndreaRosaDTO>({ ...formDefault })
const interessesRaw = ref('')
const objeccoesRaw = ref('')

// Sync data when modal opens or initialData changes
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
      interessesRaw.value = Array.isArray(form.interesses) ? form.interesses.join(', ') : ''
      objeccoesRaw.value = Array.isArray(form.objeccoes) ? form.objeccoes.join(', ') : ''
    } else {
      Object.assign(form, { ...formDefault })
      interessesRaw.value = ''
      objeccoesRaw.value = ''
    }
  }
})

function handleSubmit() {
  // Validate basic fields
  if (!form.nome || !form.contato_id) return

  // Process comma-separated strings to arrays and sanitize
  form.interesses = interessesRaw.value
    .split(',')
    .map(s => s.trim().replace(/['"]/g, '')) 
    .filter(s => !!s)

  form.objeccoes = objeccoesRaw.value
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(s => !!s)

  // Emit form data (without id/created_at for type safety)
  const { id, created_at, ...data } = form
  emit('submit', data)
}
</script>

