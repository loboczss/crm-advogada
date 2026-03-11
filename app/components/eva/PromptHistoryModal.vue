<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" @click.self="$emit('close')">
    <div class="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-[#30363d] bg-slate-50/50 dark:bg-[#161b22] flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Histórico de Versões
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualizando as alterações do agente <strong class="font-mono text-primary">{{ agentName }}</strong>
          </p>
        </div>
        
        <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar (List) -->
        <div class="w-1/3 border-r border-slate-100 dark:border-[#30363d] bg-slate-50/30 dark:bg-transparent overflow-y-auto">
          <div v-if="store.loadingHistory" class="p-8 flex flex-col items-center justify-center text-slate-400">
            <span class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></span>
            <span class="text-xs">Carregando histórico...</span>
          </div>
          
          <div v-else-if="store.history.length === 0" class="p-8 text-center text-slate-500 text-sm">
            Nenhuma versão de histórico encontrada.
          </div>

          <div v-else class="flex flex-col">
            <button
              v-for="item in store.history"
              :key="item.history_id"
              @click="selectVersion(item)"
              class="text-left px-5 py-4 border-b border-slate-100 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-[#161b22] transition-colors relative"
              :class="{ 'bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary': selectedVersion?.history_id === item.history_id }"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium" :class="selectedVersion?.history_id === item.history_id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'">
                  Versão {{ item.version }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">{{ formatDate(item.updated_at) }}</span>
              </div>
              <div class="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {{ item.user_email }}
              </div>
            </button>
          </div>
        </div>

        <!-- Detail View -->
        <div class="flex-1 bg-white dark:bg-[#0d1117] flex flex-col overflow-hidden relative">
          <div v-if="!selectedVersion" class="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-300 dark:text-slate-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p class="text-sm">Selecione uma versão ao lado para visualizar o código.</p>
          </div>

          <template v-else>
            <!-- Code Viewer -->
            <div class="flex-1 overflow-auto bg-[#0d1117] relative p-6 editor-layer custom-scrollbar">
              <div 
                v-if="renderedHtml"
                v-html="renderedHtml"
                class="font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap text-left"
              ></div>
              <div v-else class="font-mono text-[13px] leading-relaxed text-[#e6edf3] whitespace-pre-wrap">
                {{ selectedVersion.content }}
              </div>
            </div>

            <!-- Detail Footer Actions -->
            <div class="p-4 border-t border-slate-100 dark:border-[#30363d] bg-slate-50/50 dark:bg-[#161b22] flex items-center justify-between">
              <div class="text-xs text-slate-500">
                Exibindo código final da versão {{ selectedVersion.version }}.
              </div>
              <Button variant="primary" size="sm" @click="handleRestore">
                Restaurar para o Editor
              </Button>
            </div>
          </template>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEvaPromptStore } from '../../stores/evaPrompt'
import type { PromptHistoryDTO } from '../../../shared/types/EvaSystemPromptDTO'
import Button from '../Button.vue'

const props = defineProps<{
  agentName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'restore', content: string): void
}>()

const store = useEvaPromptStore()
const selectedVersion = ref<PromptHistoryDTO | null>(null)
const renderedHtml = ref('')
let highlighter: any = null

onMounted(async () => {
  await store.fetchHistory()
  if (store.history.length > 0) {
    selectVersion(store.history[0])
  }
  
  try {
    const { createHighlighter } = await import('shiki')
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['markdown']
    })
    if (selectedVersion.value) {
      renderCode(selectedVersion.value.content)
    }
  } catch (err) {
    console.error('Failed to load shiki in modal:', err)
  }
})

function selectVersion(item: PromptHistoryDTO) {
  selectedVersion.value = item
  if (highlighter) {
    renderCode(item.content)
  }
}

function renderCode(code: string) {
  if (!highlighter) return
  
  try {
    const html = highlighter.codeToHtml(code || ' ', {
      lang: 'markdown',
      theme: 'github-dark'
    })
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const inner = doc.querySelector('code')?.innerHTML
    
    if (inner) {
      renderedHtml.value = inner
    }
  } catch (err) {
    console.error('Shiki render error:', err)
  }
}

function handleRestore() {
  if (selectedVersion.value) {
    const confirm = window.confirm(`Deseja carregar a Versão ${selectedVersion.value.version} no editor? As mudanças não serão salvas até você clicar em Salvar.`)
    if (confirm) {
      emit('restore', selectedVersion.value.content)
    }
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.editor-layer {
  scrollbar-width: thin;
  scrollbar-color: #30363d transparent;
}
.editor-layer::-webkit-scrollbar {
  width: 8px;
}
.editor-layer::-webkit-scrollbar-track {
  background: transparent;
}
.editor-layer::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 10px;
}
.editor-layer::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>
