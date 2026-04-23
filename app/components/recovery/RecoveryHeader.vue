<template>
  <header class="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
    <NuxtLink to="/login" class="flex items-center gap-3 group">
      <img src="/logo-andrea-rosa.png" alt="Andréa Rosa Logo" class="h-10 w-auto dark:hidden transition-transform group-hover:scale-105" />
      <img src="/logo-andrea-rosa-white.png" alt="Andréa Rosa Logo" class="h-10 w-auto hidden dark:block transition-transform group-hover:scale-105" />
    </NuxtLink>
    <DarkModeToggle />
  </header>
</template>

<script setup lang="ts">
import DarkModeToggle from '../DarkModeToggle.vue'
</script>
