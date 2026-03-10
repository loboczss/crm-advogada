<template>
  <div class="flex items-center gap-3">
    <div class="h-px bg-border-light dark:bg-border-dark flex-1"></div>
    <span class="text-xs text-gray-400">{{ label }}</span>
    <div class="h-px bg-border-light dark:bg-border-dark flex-1"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'ou'
})
</script>
