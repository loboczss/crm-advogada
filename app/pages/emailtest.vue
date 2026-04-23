<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 text-slate-900 dark:text-slate-100">
    <div class="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 class="text-3xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">Teste de Email</h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Verifique a integração global via Resend API</p>
      </div>

      <Card variant="light" class="p-8 border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <!-- Background Decoration -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <form @submit.prevent="handleSend" class="relative z-10 space-y-6">
          <Input 
            v-model="form.to" 
            label="Destinatário" 
            type="email" 
            placeholder="email@exemplo.com" 
          />
          
          <Input 
            v-model="form.subject" 
            label="Assunto" 
            placeholder="Assunto do email..." 
          />
          
          <div class="space-y-3 group">
            <label class="block text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-slate-500 dark:text-gray-400 group-focus-within:text-primary transition-colors">Conteúdo HTML</label>
            <textarea 
              v-model="form.html" 
              rows="6"
              class="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-slate-50 dark:focus:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 resize-none shadow-sm"
              placeholder="<h1>Olá!</h1><p>Esta é uma mensagem de teste.</p>"
            ></textarea>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="p-4 rounded-2xl bg-danger-50 border border-danger-100 text-danger-600 dark:bg-danger-500/10 dark:border-danger-500/20 dark:text-danger-400 text-xs font-bold flex items-start gap-3">
            <Icon name="ph:warning-circle-bold" class="w-4 h-4 shrink-0 mt-0.5" />
            <p>{{ error }}</p>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            class="w-full shadow-glow-primary/20 mt-4" 
            :disabled="!isValid || isSending"
          >
            <div class="flex items-center justify-center gap-2">
              <Icon v-if="isSending" name="ph:spinner-gap-bold" class="w-5 h-5 animate-spin" />
              <Icon v-else name="ph:paper-plane-right-bold" class="w-5 h-5" />
              <span>{{ isSending ? 'Enviando...' : 'Enviar Email de Teste' }}</span>
            </div>
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmailStore } from '../stores/email'
import Card from '../components/Card.vue'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'

const emailStore = useEmailStore()
const { isSending, error } = storeToRefs(emailStore)

const form = reactive({
  to: '',
  subject: 'Teste de Integração Resend - Andréa Rosa',
  html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <h2 style="color: #2f81f7; margin-bottom: 24px; font-weight: 900;">Conexão Estabelecida! 🚀</h2>
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">Parabéns, a integração de emails está funcionando perfeitamente pela plataforma Andréa Rosa CRM.</p>
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 32px;">
    <p style="color: #64748b; font-size: 14px; margin: 0;">Este é um email automatizado disparado a partir da nova página de testes.</p>
  </div>
</div>
  `.trim()
})

const isValid = computed(() => {
  return form.to.length > 0 && form.subject.length > 0 && form.html.length > 0
})

async function handleSend() {
  const success = await emailStore.sendEmail({
    to: form.to,
    subject: form.subject,
    html: form.html
  })

  if (success) {
    alert('Email enviado com sucesso pela Resend!')
    form.to = ''
  }
}
</script>
