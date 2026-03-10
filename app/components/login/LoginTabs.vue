<template>
  <div class="flex items-center gap-2 rounded-2xl bg-surface-light dark:bg-surface-dark p-1">
    <button
      type="button"
      :class="[
        'flex-1 rounded-xl py-2 text-sm font-semibold transition-all',
        modelValue === 'login'
          ? 'bg-white dark:bg-slate-900 text-text-light dark:text-text-dark shadow'
          : 'text-gray-500 dark:text-gray-400'
      ]"
      @click="$emit('update:modelValue', 'login')"
    >
      Entrar
    </button>
    <button
      type="button"
      :class="[
        'flex-1 rounded-xl py-2 text-sm font-semibold transition-all',
        modelValue === 'signup'
          ? 'bg-white dark:bg-slate-900 text-text-light dark:text-text-dark shadow'
          : 'text-gray-500 dark:text-gray-400'
      ]"
      @click="$emit('update:modelValue', 'signup')"
    >
      Cadastro
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: 'login' | 'signup'
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: 'login' | 'signup']
}>()
</script>
