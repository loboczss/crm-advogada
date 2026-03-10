<template>
  <Modal
    :is-open="isOpen"
    @close="closeModal"
    :title="`Detalhes • ${crmData?.nome || contatoId || 'Carregando...'}`"
    description="Visão 360 do cliente com histórico completo"
    max-width="4xl"
  >
    <!-- Loading State -->
    <div v-if="loading" class="p-8 flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-4">
        <svg class="w-10 h-10 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-sm font-bold text-text-light/50 dark:text-text-dark/50 uppercase tracking-widest">Buscando histórico 360...</p>
      </div>
    </div>

    <!-- Ready State -->
    <div v-else class="flex flex-col h-full max-h-[70vh]">
      
      <!-- Tab Navigation -->
      <div class="flex items-center gap-2 p-4 border-b border-border-light dark:border-white/5 bg-surface-light/30 dark:bg-white/5 sticky top-0 z-20 backdrop-blur-md">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300"
          :class="activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-transparent text-text-light/50 dark:text-text-dark/50 hover:bg-surface-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-white'"
        >
          <Icon :name="tab.icon" class="text-lg" />
          {{ tab.label }}
          
          <span v-if="tab.badge !== undefined" class="ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[9px]">
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- Tab Contents -->
      <div class="flex-1 overflow-y-auto p-6 bg-surface-light/10 dark:bg-transparent">
        
        <!-- Tab 1: CRM Details -->
        <div v-if="activeTab === 'crm'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div v-if="!crmData" class="text-center py-12 text-text-light/40 dark:text-text-dark/40 font-bold">
            Nenhum dado de CRM encontrado para este contato.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Info Card -->
            <div class="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-border-light dark:border-white/5 shadow-sm space-y-4">
              <h3 class="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Icon name="ph:user-circle-bold" class="text-lg" /> Perfil Principal
              </h3>
              
              <div class="space-y-3">
                <div>
                  <label class="text-[10px] font-bold text-text-light/40 dark:text-text-dark/40 uppercase tracking-widest">Email</label>
                  <p class="text-sm font-semibold text-text-light dark:text-white">{{ crmData.email || 'Não informado' }}</p>
                </div>
                <div>
                  <label class="text-[10px] font-bold text-text-light/40 dark:text-text-dark/40 uppercase tracking-widest">Localização</label>
                  <p class="text-sm font-semibold text-text-light dark:text-white">{{ crmData.cidade || 'Não informado' }}</p>
                </div>
                <div>
                  <label class="text-[10px] font-bold text-text-light/40 dark:text-text-dark/40 uppercase tracking-widest">Rede Social</label>
                  <p class="text-sm font-semibold text-blue-500">@{{ crmData.nome_social || 'Não informado' }}</p>
                </div>
              </div>
            </div>

            <!-- Context Card -->
            <div class="bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-border-light dark:border-white/5 shadow-sm space-y-4">
               <h3 class="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Icon name="ph:target-bold" class="text-lg" /> Contexto & Sentimento
              </h3>

              <div class="flex flex-wrap gap-3">
                <div class="px-4 py-2 rounded-xl border border-border-light dark:border-white/10 bg-surface-light dark:bg-white/5 flex flex-col items-center">
                  <span class="text-[9px] font-bold text-text-light/40 uppercase tracking-widest mb-1">Urgência</span>
                  <span class="text-xs font-black" :class="getUrgencyClass(crmData.urgencia)">{{ crmData.urgencia || 'Média' }}</span>
                </div>
                <div class="px-4 py-2 rounded-xl border border-border-light dark:border-white/10 bg-surface-light dark:bg-white/5 flex flex-col items-center">
                  <span class="text-[9px] font-bold text-text-light/40 uppercase tracking-widest mb-1">Sentimento</span>
                  <div class="flex items-center gap-1.5 font-black text-xs">
                     <Icon :name="getSentimentIcon(crmData.sentimento)" :class="crmData.sentimento?.includes('Positivo') ? 'text-success' : 'text-warning'" />
                     {{ crmData.sentimento || 'Neutro' }}
                  </div>
                </div>
              </div>
              
              <div v-if="crmData.interesses" class="pt-2">
                <label class="block text-[10px] font-bold text-text-light/40 dark:text-text-dark/40 uppercase tracking-widest mb-2">Interesses</label>
                <div class="flex flex-wrap gap-1.5">
                   <span v-for="tag in parseJsonArray(crmData.interesses)" :key="tag" class="bg-primary/5 text-primary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/10">
                     {{ tag }}
                   </span>
                </div>
              </div>
            </div>

            <!-- Resumo Perfil -->
            <div class="col-span-1 md:col-span-2 bg-white dark:bg-background-dark/50 rounded-2xl p-6 border border-border-light dark:border-white/5 shadow-sm">
               <h3 class="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                <Icon name="ph:article-bold" class="text-lg" /> Resumo do Perfil IA
              </h3>
              <p class="text-sm leading-relaxed text-text-light/80 dark:text-text-dark/80 whitespace-pre-wrap">{{ crmData.resumo_perfil || 'Ainda não há um resumo detalhado gerado pela IA para este lead.' }}</p>
            </div>

          </div>
        </div>

        <!-- Tab 2: Vendas -->
        <div v-else-if="activeTab === 'vendas'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div v-if="vendasData.length === 0" class="text-center flex flex-col items-center justify-center py-16 space-y-4">
              <div class="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10 text-primary/50">
                <Icon name="ph:receipt-bold" class="text-4xl" />
              </div>
              <div>
                <p class="text-lg font-black text-text-light dark:text-white">Nenhuma venda encontrada</p>
                <p class="text-xs font-bold text-text-light/40 uppercase tracking-widest mt-1">Este contato ainda não possui histórico de vendas.</p>
              </div>
           </div>
           
           <div v-else class="space-y-3">
             <div v-for="venda in vendasData" :key="venda.id" class="bg-white dark:bg-background-dark/50 rounded-2xl p-5 border border-border-light dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                
                <div class="flex items-center gap-4">
                   <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                     <Icon name="ph:currency-dollar-bold" class="text-xl" />
                   </div>
                   <div>
                     <p class="text-xs font-black uppercase tracking-widest text-text-light/40 dark:text-text-dark/40">{{ formatDate(venda.created_at) }}</p>
                     <p class="text-lg font-black text-text-light dark:text-white">{{ formatCurrency(venda.valor_venda) }}</p>
                   </div>
                </div>

                <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                   <div class="px-4 py-2 bg-surface-light dark:bg-white/5 rounded-xl border border-border-light dark:border-white/5 text-xs">
                     <span class="font-bold text-text-light/40 uppercase tracking-widest">Vendedor:</span> <span class="font-semibold ml-1 text-text-light dark:text-white">{{ venda.vendedor || '-' }}</span>
                   </div>
                   <div class="px-4 py-2 bg-surface-light dark:bg-white/5 rounded-xl border border-border-light dark:border-white/5 text-xs">
                     <span class="font-bold text-text-light/40 uppercase tracking-widest">Embarque:</span> <span class="font-semibold ml-1 text-text-light dark:text-white">{{ formatDate(venda.embarque) }}</span>
                   </div>
                   
                   <span class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center" :class="getStatusClass(venda.status)">
                      {{ venda.status || 'Desconhecido' }}
                   </span>
                </div>
             </div>
           </div>
        </div>

        <!-- Tab 3: WhatsApp Timeline -->
        <div v-else-if="activeTab === 'whatsapp'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div v-if="whatsappData.length === 0" class="text-center flex flex-col items-center justify-center py-16 space-y-4">
              <div class="w-20 h-20 bg-success/5 rounded-full flex items-center justify-center border border-success/10 text-success/50">
                <Icon name="ph:whatsapp-logo-bold" class="text-4xl" />
              </div>
              <div>
                <p class="text-lg font-black text-text-light dark:text-white">Nenhuma mensagem trocada</p>
                <p class="text-xs font-bold text-text-light/40 uppercase tracking-widest mt-1">Este contato não possui histórico de WhatsApp.</p>
              </div>
           </div>

           <div v-else class="space-y-4 max-w-3xl mx-auto flex flex-col">
              <div 
                v-for="msg in whatsappData" 
                :key="msg.id"
                class="flex flex-col max-w-[85%]"
                :class="msg.fromMe === 'outgoing' ? 'self-end items-end' : 'self-start items-start'"
              >
                <!-- Sent Sender Name Indicator -->
                <span v-if="msg.fromMe === 'outgoing' && msg.vendedor" class="text-[9px] font-bold text-text-light/40 uppercase tracking-widest mb-1 px-1">
                  Atendente: {{ msg.vendedor }}
                </span>
                
                <div 
                  class="px-5 py-3 rounded-2xl shadow-sm relative text-sm w-full break-words overflow-hidden"
                  :class="msg.fromMe === 'outgoing' 
                    ? 'bg-success text-white rounded-tr-sm border border-success' 
                    : 'bg-white dark:bg-background-dark border border-border-light dark:border-white/10 text-text-light dark:text-white rounded-tl-sm'"
                >
                  <p class="whitespace-pre-wrap leading-relaxed break-words">{{ msg.texto }}</p>
                  
                  <div class="mt-1 flex items-center gap-1.5 opacity-60" :class="msg.fromMe === 'outgoing' ? 'justify-end text-white' : 'justify-end text-text-light/60 dark:text-white'">
                     <span class="text-[9px] font-bold">{{ formatTime(msg.created_at) }}</span>
                     <Icon v-if="msg.fromMe === 'outgoing'" name="ph:check-circle-fill" class="text-[10px]" />
                  </div>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  contatoId: string | null
}>()

const emit = defineEmits(['close'])

const closeModal = () => emit('close')

const activeTab = ref('crm')
const loading = ref(false)

const crmData = ref<any>(null)
const vendasData = ref<any[]>([])
const whatsappData = ref<any[]>([])

const tabs = computed(() => [
  { id: 'crm', label: 'Dados CRM', icon: 'ph:user-list-bold' },
  { id: 'vendas', label: 'Histórico Vendas', icon: 'ph:currency-dollar-bold', badge: vendasData.value.length || undefined },
  { id: 'whatsapp', label: 'Conversas', icon: 'ph:whatsapp-logo-bold', badge: whatsappData.value.length || undefined }
])

const fetchData = async () => {
  if (!props.contatoId) return
  
  loading.value = true
  activeTab.value = 'crm'
  
  try {
    const { data } = await useFetch(`/api/crm/evastur/details/${props.contatoId}`)
    if (data.value) {
      crmData.value = data.value.crm
      vendasData.value = data.value.vendas
      whatsappData.value = data.value.whatsapp
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do contato:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.contatoId) {
    fetchData()
  } else {
    crmData.value = null
    vendasData.value = []
    whatsappData.value = []
  }
})

// --- Utilities ---
const parseJsonArray = (val: any) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { 
    return JSON.parse(val) 
  } catch { 
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
    return [] 
  }
}

const formatCurrency = (val: number) => {
  return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatTime = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const getUrgencyClass = (urgency: string) => {
  if (!urgency) return 'text-primary'
  const u = urgency.toLowerCase()
  if (u.includes('alta')) return 'text-danger'
  if (u.includes('média') || u.includes('media')) return 'text-warning'
  return 'text-success'
}

const getSentimentIcon = (sentiment: string) => {
  if (!sentiment) return 'ph:smiley-meh-bold'
  const s = sentiment.toLowerCase()
  if (s.includes('positivo')) return 'ph:smiley-bold'
  if (s.includes('neutro')) return 'ph:smiley-meh-bold'
  return 'ph:smiley-sad-bold'
}

const getStatusClass = (status: string) => {
  const s = (status || '').toLowerCase()
  if (s.includes('confirmado') || s.includes('emitida')) return 'bg-success/10 text-success border border-success/20'
  if (s.includes('pendente') || s.includes('processo')) return 'bg-warning/10 text-warning border border-warning/20'
  if (s.includes('cancelado')) return 'bg-danger/10 text-danger border border-danger/20'
  return 'bg-surface-light dark:bg-white/5 border border-border-light dark:border-white/10 text-text-light/50 dark:text-text-dark/40'
}
</script>
