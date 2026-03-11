<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-8 text-center space-y-6">
      <!-- Icon / Status -->
      <div class="flex justify-center">
        <div v-if="status === 'loading'" class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="ph:spinner-gap-bold" class="w-8 h-8 text-primary animate-spin" />
        </div>
        <div v-else-if="status === 'success'" class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <Icon name="ph:check-circle-bold" class="w-8 h-8 text-green-500" />
        </div>
        <div v-else class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <Icon name="ph:x-circle-bold" class="w-8 h-8 text-red-500" />
        </div>
      </div>

      <!-- Text -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ title }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          {{ message }}
        </p>
      </div>

      <!-- Action -->
      <div v-if="status !== 'loading'" class="pt-4">
        <button 
          @click="closeWindow"
          class="w-full py-3 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
        >
          Fechar Janela
        </button>
      </div>
      
      <div v-else class="pt-4">
        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Sincronizando com Evastur...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from '#imports'

// Disable any layout or middleware that might interfere
definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const status = ref<'loading' | 'success' | 'error'>('loading')
const title = ref('Conectando ao Dropbox')
const message = ref('Estamos processando sua autorização. Por favor, aguarde um momento.')

onMounted(() => {
  // Extract parameters from URL (Dropbox OAuth2 usually returns 'code' or 'access_token')
  const { code, state, error, error_description } = route.query

  if (error) {
    status.value = 'error'
    title.value = 'Falha na Conexão'
    message.value = (error_description as string) || 'Não foi possível autorizar o acesso ao seu Dropbox.'
    sendResultToOpener({ success: false, error })
    return
  }

  if (code) {
    // Successfully received code
    status.value = 'success'
    title.value = 'Dropbox Conectado!'
    message.value = 'A autorização foi concluída com sucesso. Você já pode fechar esta janela.'
    sendResultToOpener({ success: true, code, state })
    
    // Auto-close if success and we can detect it was a popup
    if (window.opener) {
      setTimeout(closeWindow, 3000)
    }
  } else {
    // No parameters found
    status.value = 'error'
    title.value = 'Acesso Inválido'
    message.value = 'Nenhum código de autorização foi encontrado. Tente conectar novamente.'
    sendResultToOpener({ success: false, error: 'no_params' })
  }
})

function sendResultToOpener(data: any) {
  if (window.opener) {
    try {
      window.opener.postMessage({
        type: 'DROPBOX_OAUTH_RESULT',
        ...data
      }, window.location.origin)
    } catch (e) {
      console.error('Failed to postMessage to opener:', e)
    }
  }
}

function closeWindow() {
  window.close()
}
</script>
