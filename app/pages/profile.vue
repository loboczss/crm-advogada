<template>
  <div class="min-h-screen bg-gradient-to-br from-background-light via-blue-50 to-purple-50 dark:bg-gradient-to-br dark:from-background-dark dark:via-background-dark dark:to-background-dark text-text-light dark:text-text-dark transition-colors duration-500">
    <main class="container mx-auto px-4 py-12 max-w-5xl">
      <!-- Header Section -->
      <section class="mb-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text leading-tight">
              Meu Perfil
            </h1>
            <p class="text-lg text-slate-500 dark:text-gray-400 font-medium max-w-2xl">
              Gerencie suas informações pessoais, segurança e preferências de conta.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <Button variant="outline" @click="navigateTo('/')">Voltar</Button>
            <Button variant="primary" class="shadow-glow-primary" @click="handleSave">Salvar</Button>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar: Profile Preview -->
        <div class="lg:col-span-1 space-y-8">
          <Card variant="light" class="text-center p-8 border border-slate-200 dark:border-white/10 group">
            <div class="relative inline-block mb-6">
              <div class="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary p-[2px] shadow-glow-primary/20 group-hover:scale-105 transition-transform duration-500">
                <div class="w-full h-full rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-4xl font-black text-primary dark:text-white overflow-hidden">
                  {{ initials }}
                </div>
              </div>
              <button class="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg text-primary hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-1">{{ profileData.name }}</h3>
            <p class="text-sm font-medium text-slate-500 dark:text-gray-400 mb-4">{{ profileData.email }}</p>
            <Badge variant="primary" class="mx-auto">Membro Ativo</Badge>
          </Card>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 gap-4">
            <Card variant="light" class="p-4 border border-slate-200 dark:border-white/10">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Assinatura</p>
              <p class="text-lg font-black text-primary">Anual</p>
            </Card>
            <Card variant="light" class="p-4 border border-slate-200 dark:border-white/10">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <p class="text-lg font-black text-emerald-500">Ativo</p>
            </Card>
          </div>
        </div>

        <!-- Main Content: Form Sections -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Personal Information -->
          <Card variant="light" class="border border-slate-200 dark:border-white/10">
            <div class="flex items-center gap-3 mb-8">
              <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white">Informações Pessoais</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                v-model="profileData.name" 
                label="Nome Completo" 
                placeholder="Ex: João Silva"
              />
              <Input 
                v-model="profileData.email" 
                label="E-mail" 
                placeholder="seu.email@exemplo.com"
                disabled
              />
              <Input 
                v-model="profileData.phone" 
                label="Telefone / WhatsApp" 
                placeholder="(00) 00000-0000"
              />
              <Input 
                v-model="profileData.company" 
                label="Empresa" 
                placeholder="Nome da sua empresa"
              />
            </div>
          </Card>

          <!-- Security -->
          <Card variant="light" class="border border-slate-200 dark:border-white/10">
            <div class="flex items-center gap-3 mb-8">
              <div class="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white">Segurança & Senha</h2>
            </div>

            <div class="space-y-6">
              <Alert variant="warning" title="Segurança da Conta" class="mb-6">
                Recomendamos trocar sua senha periodicamente para manter sua conta protegida.
              </Alert>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  v-model="securityData.currentPassword" 
                  type="password"
                  label="Senha Atual" 
                  placeholder="••••••••"
                />
                <div class="hidden md:block"></div>
                <Input 
                  v-model="securityData.newPassword" 
                  type="password"
                  label="Nova Senha" 
                  placeholder="Mínimo 8 caracteres"
                />
                <Input 
                  v-model="securityData.confirmPassword" 
                  type="password"
                  label="Confirmar Nova Senha" 
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
          </Card>

          <!-- Danger Zone -->
          <Card variant="light" class="border border-danger/20 dark:border-danger/30 bg-danger/5">
            <div class="flex items-center justify-between gap-6">
              <div>
                <h3 class="text-xl font-black text-danger mb-1">Zona Crítica</h3>
                <p class="text-sm text-slate-500 dark:text-gray-400">Uma vez que você deletar sua conta, não há volta. Por favor, tenha certeza.</p>
              </div>
              <Button variant="danger" class="whitespace-nowrap">Deletar Conta</Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProfileStore } from '../stores/profile'
import { definePageMeta, navigateTo } from '#imports'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import Input from '../components/Input.vue'
import Badge from '../components/Badge.vue'
import Alert from '../components/Alert.vue'

definePageMeta({ middleware: 'auth' })

const profileStore = useProfileStore()
const { profile, loading, error: storeError } = storeToRefs(profileStore)

const profileData = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
})

const securityData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Sincronizar dados do store para o formulário local
watch(profile, (newProfile) => {
  if (newProfile) {
    profileData.name = newProfile.name || ''
    profileData.email = newProfile.email || ''
    profileData.phone = newProfile.phone || ''
    profileData.company = newProfile.company || ''
  }
}, { immediate: true })

onMounted(async () => {
  if (!profile.value) {
    await profileStore.fetchMe()
  }
})

const initials = computed(() => {
  const name = profileData.name || 'Usuário'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p: string) => p[0]).join('').toUpperCase() || 'U'
})

async function handleSave() {
  try {
    await profileStore.updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      company: profileData.company
    })
    alert('Perfil atualizado com sucesso!')
  } catch (e: any) {
    alert('Erro ao atualizar perfil: ' + (e.message || 'Erro desconhecido'))
  }
}
</script>

<style scoped>
.shadow-glow-primary {
  box-shadow: 0 0 20px -5px rgba(59, 130, 246, 0.5);
}
</style>
