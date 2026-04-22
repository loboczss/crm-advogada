<template>
  <div class="min-h-screen bg-gradient-to-br from-background-light via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
    <header class="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/logo-blue.svg" alt="Evastur Logo" class="h-12 w-auto dark:hidden" />
        <img src="/logo-white.svg" alt="Evastur Logo" class="h-12 w-auto hidden dark:block" />
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-10 items-start">
      <section class="space-y-6">
        <LoginBadge>Nova area de login</LoginBadge>
        <h1 class="text-4xl md:text-5xl font-extrabold text-text-light dark:text-text-dark leading-tight">
          Bem-vindo de volta ao seu painel
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Entre com seus dados para acessar os recursos do seu negocio com total seguranca.
        </p>

      </section>

      <section>
        <Card variant="light" class="p-8">
          <div class="space-y-6">
            <LoginTabs v-model="activeTab" />

            <div v-if="activeTab === 'login'" class="space-y-6">
              <div>
                <h2 class="text-2xl font-bold text-text-light dark:text-text-dark">Entrar</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Use seu email e senha para acessar.</p>
              </div>

              <form class="space-y-4" @submit.prevent="handleLogin">
                <Input v-model="loginForm.email" label="Email" type="email" placeholder="voce@empresa.com" />
                <Input v-model="loginForm.password" label="Senha" type="password" placeholder="********" />

                <LoginHelperRow />

                <p v-if="loginError" class="text-sm text-danger dark:text-danger-300">{{ loginError }}</p>

                <Button variant="primary" size="lg" class="w-full" :disabled="loginLoading">
                  {{ loginLoading ? 'Entrando...' : 'Entrar' }}
                </Button>

                <div class="text-center pt-2">
                  <NuxtLink to="/privacidade" class="text-xs text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest font-bold italic">
                    Leia nossa política de privacidade
                  </NuxtLink>
                </div>
              </form>
            </div>

            <div v-else class="space-y-6">
              <div>
                <h2 class="text-2xl font-bold text-text-light dark:text-text-dark">Criar conta</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Preencha todos os dados para criar sua conta de acesso.</p>
              </div>

              <form class="space-y-4" @submit.prevent="handleSignup">
                <Input 
                  v-model="signupForm.name" 
                  label="Nome completo" 
                  type="text" 
                  placeholder="Ex: João Silva"
                  required
                />
                <Input 
                  v-model="signupForm.email" 
                  label="Email" 
                  type="email" 
                  placeholder="seu.email@empresa.com"
                  required
                />
                <Input 
                  v-model="signupForm.password" 
                  label="Senha" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <Input 
                  v-model="signupForm.confirmPassword" 
                  label="Confirmar senha" 
                  type="password" 
                  placeholder="Repita sua senha"
                  required
                />

                <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input v-model="signupForm.acceptTerms" type="checkbox" class="rounded border-border-light dark:border-border-dark" />
                  Aceito os <NuxtLink to="/privacidade" class="text-blue-600 underline hover:text-blue-700 transition-colors">termos e políticas</NuxtLink>
                </label>

                <p v-if="signupError" class="text-sm text-danger dark:text-danger-300">{{ signupError }}</p>
                <p v-if="signupSuccess" class="text-sm text-success dark:text-success-300">{{ signupSuccess }}</p>

                <Button variant="secondary" size="lg" class="w-full" :disabled="signupLoading">
                  {{ signupLoading ? 'Criando conta...' : 'Criar conta' }}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHead } from '#imports'

useHead({ title: 'Login | Evastur' })
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'
import Input from '../components/Input.vue'
import DarkModeToggle from '../components/DarkModeToggle.vue'
import LoginBadge from '../components/login/LoginBadge.vue'
import LoginDivider from '../components/login/LoginDivider.vue'
import LoginHelperRow from '../components/login/LoginHelperRow.vue'

import LoginTabs from '../components/login/LoginTabs.vue'
import { navigateTo, useSupabaseClient, useSupabaseUser } from '#imports'

const activeTab = ref<'login' | 'signup'>('login')
const user = useSupabaseUser()

watch(user, () => {
  if (user.value) {
    navigateTo('/')
  }
}, { immediate: true })

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const loginLoading = ref(false)
const loginError = ref('')

const signupLoading = ref(false)
const signupError = ref('')
const signupSuccess = ref('')

const supabase = useSupabaseClient()

async function handleLogin() {
  loginError.value = ''

  if (!loginForm.value.email || !loginForm.value.password) {
    loginError.value = 'Preencha email e senha.'
    return
  }

  loginLoading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: loginForm.value.email.trim().toLowerCase(),
    password: loginForm.value.password
  })
  loginLoading.value = false

  if (error) {
    const errorCode = (error.code || '').toString().toLowerCase().trim()
    const errorMessage = (error.message || '').toString().toLowerCase().trim()
    const isEmailNotConfirmed =
      errorCode.includes('email_not_confirmed') ||
      errorMessage.includes('email_not_confirmed') ||
      errorMessage.includes('email not confirmed') ||
      errorMessage.includes('e-mail not confirmed')

    loginError.value = isEmailNotConfirmed
      ? 'Email não confirmado. Verifique sua caixa de entrada para confirmar a conta.'
      : 'Email ou senha incorretos.'
    return
  }

  // A navegação agora é tratada pelo watch(user)
}

async function handleSignup() {
  signupError.value = ''
  signupSuccess.value = ''

  if (!signupForm.value.name.trim()) {
    signupError.value = '❌ Por favor, informe seu nome completo.'
    return
  }

  if (!signupForm.value.email) {
    signupError.value = '❌ Por favor, informe um email válido.'
    return
  }

  if (!signupForm.value.password) {
    signupError.value = '❌ Por favor, informe uma senha.'
    return
  }

  if (signupForm.value.password.length < 6) {
    signupError.value = '❌ A senha deve ter no mínimo 6 caracteres. Atual: ' + signupForm.value.password.length + ' caracteres.'
    return
  }

  if (signupForm.value.password !== signupForm.value.confirmPassword) {
    signupError.value = '❌ As senhas não correspondem. Verifique se digitou igual em ambos os campos.'
    return
  }

  if (!signupForm.value.acceptTerms) {
    signupError.value = '❌ Você precisa aceitar os termos e políticas para continuar.'
    return
  }

  signupLoading.value = true
  const { error } = await supabase.auth.signUp({
    email: signupForm.value.email.trim().toLowerCase(),
    password: signupForm.value.password,
    options: {
      data: {
        name: signupForm.value.name.trim()
      }
    }
  })

  signupLoading.value = false

  if (error) {
    // Interpretar erro específico do Supabase
    const errorCode = (error.code || '').toString().toLowerCase().trim()
    const errorMessage = (error.message || '').toString().toLowerCase().trim()

    if (errorMessage.includes('user already exists') || errorMessage.includes('user_already_exists')) {
      signupError.value = '❌ Este email já está registrado. Faça login ou recupere sua senha.'
    } else if (errorMessage.includes('invalid email') || errorMessage.includes('invalid_email')) {
      signupError.value = '❌ Email inválido. Verifique o formato (ex: seu.email@empresa.com).'
    } else if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      signupError.value = '❌ Senha muito fraca. Use números, letras maiúsculas e minúsculas.'
    } else if (errorMessage.includes('network') || errorCode.includes('network')) {
      signupError.value = '❌ Erro de conexão. Verifique sua internet e tente novamente.'
    } else if (error.status === 429) {
      signupError.value = '❌ Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    } else {
      // Mensagem padrão com mais contexto
      signupError.value = '❌ ' + (error.message || 'Não foi possível criar a conta. Verifique os dados e tente novamente.')
    }
    return
  }

  signupSuccess.value = '✅ Conta criada com sucesso! Verifique seu email para confirmar o cadastro.'
  await navigateTo('/confirm')
}
</script>
