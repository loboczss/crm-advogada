<template>
  <Card variant="light" class="p-4">
    <p class="text-sm text-gray-500 dark:text-gray-300">{{ label }}</p>
    <p class="text-2xl font-bold text-text-light dark:text-text-dark">{{ value }}</p>
  </Card>
</template>

<script setup lang="ts">
import Card from '../Card.vue'

interface Props {
  label: string
  value: string
}

defineProps<Props>()
</script>
