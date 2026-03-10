<template>
  <div class="min-h-screen bg-gradient-to-br from-background-light via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
    <RecoveryHeader />

    <main class="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-10 items-start">
      <section class="space-y-6">
        <LoginBadge>Segurança em primeiro lugar</LoginBadge>
        <h1 class="text-4xl md:text-5xl font-extrabold text-text-light dark:text-text-dark leading-tight">
          Recupere seu acesso de forma simples
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Não se preocupe, acontece com os melhores. Enviaremos um link seguro para você redefinir sua senha.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <LoginStatCard label="Processamento seguro" value="SSL" />
          <LoginStatCard label="Suporte rápido" value="24/7" />
        </div>
      </section>

      <section>
        <Card variant="light" class="p-8">
          <RecoveryForm />
        </Card>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import RecoveryHeader from '../components/recovery/RecoveryHeader.vue'
import RecoveryForm from '../components/recovery/RecoveryForm.vue'
import Card from '../components/Card.vue'
import LoginBadge from '../components/login/LoginBadge.vue'
import LoginStatCard from '../components/login/LoginStatCard.vue'

definePageMeta({
  layout: false,
  middleware: []
})
</script>
