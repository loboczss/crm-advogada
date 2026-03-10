<template>
  <button
    :class="[
      'rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative group',
      variantClasses,
      sizeClasses,
    ]"
    :disabled="disabled"
  >
    <div class="absolute inset-0 bg-white/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-br from-primary to-primary-dark text-white hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] shadow-lg',
    secondary: 'bg-gradient-to-br from-secondary to-secondary-dark text-white hover:shadow-glow-secondary hover:scale-[1.02] active:scale-[0.98] shadow-lg',
    success: 'bg-gradient-to-br from-success to-success-dark text-white hover:shadow-glow-success hover:scale-[1.02] active:scale-[0.98] shadow-lg',
    danger: 'bg-danger text-white hover:bg-danger-dark shadow-md hover:scale-[1.02] active:scale-[0.98]',
    warning: 'bg-warning text-black hover:bg-warning-dark shadow-md hover:scale-[1.02] active:scale-[0.98]',
    info: 'bg-info text-white hover:bg-info-dark shadow-md hover:scale-[1.02] active:scale-[0.98]',
    outline: 'border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all'
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs font-bold uppercase tracking-wider',
    md: 'px-6 py-2.5 text-sm font-bold uppercase tracking-widest',
    lg: 'px-10 py-4 text-base font-black uppercase tracking-[0.2em]'
  }
  return sizes[props.size]
})
</script>

<style scoped>
button {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
