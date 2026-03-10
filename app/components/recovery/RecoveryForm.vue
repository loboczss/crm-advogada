<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-text-light dark:text-text-dark">Recuperar senha</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Informe seu email para receber as instruções de recuperação.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="handleRecovery">
      <Input
        v-model="email"
        label="Email"
        type="email"
        placeholder="voce@empresa.com"
        required
      />

      <p v-if="errorMsg" class="text-sm text-danger dark:text-danger-300">
        {{ errorMsg }}
      </p>
      
      <p v-if="successMsg" class="text-sm text-success dark:text-success-300">
        {{ successMsg }}
      </p>

      <Button
        variant="primary"
        size="lg"
        class="w-full"
        :disabled="loading"
      >
        {{ loading ? 'Enviando...' : 'Enviar instruções' }}
      </Button>

      <div class="text-center">
        <NuxtLink
          to="/login"
          class="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Voltar para o login
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Input from '../Input.vue'
import Button from '../Button.vue'
import { useSupabaseClient } from '#imports'

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const supabase = useSupabaseClient()

async function handleRecovery() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!email.value.trim()) {
    errorMsg.value = 'Por favor, informe seu email.'
    return
  }

  loading.value = true
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/confirm`
    })

    if (error) {
      errorMsg.value = 'Ocorreu um erro ao enviar o email. Verifique se o endereço está correto.'
    } else {
      successMsg.value = 'Instruções enviadas! Verifique sua caixa de entrada.'
      email.value = ''
    }
  } catch (err) {
    errorMsg.value = 'Erro inesperado. Tente novamente mais tarde.'
  } finally {
    loading.value = true // Keep disabled after success or error for a bit? Or just reset?
    // Let's reset loading but maybe keep button disabled if success
    if (!successMsg.value) {
      loading.value = false
    }
  }
}
</script>
