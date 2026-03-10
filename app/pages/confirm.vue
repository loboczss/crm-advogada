<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-light via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-6">
    <Card variant="light" class="p-8 max-w-md w-full">
      <div class="space-y-4 text-center">
        <div class="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto">
          ✓
        </div>
        <div>
          <h1 class="text-2xl font-bold text-text-light dark:text-text-dark">Confirmando acesso...</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Aguarde enquanto validamos sua conta.</p>
        </div>
        <p v-if="error" class="text-sm text-danger dark:text-danger-300">{{ error }}</p>
        <Button variant="outline" class="w-full" @click="goLogin">Voltar para login</Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { navigateTo, useSupabaseCookieRedirect, useSupabaseUser } from '#imports'
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'

const error = ref('')
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

watch(
  user,
  () => {
    if (user.value) {
      const path = redirectInfo.pluck()
      navigateTo(path || '/')
    }
  },
  { immediate: true }
)

function goLogin() {
  navigateTo('/login')
}
</script>
