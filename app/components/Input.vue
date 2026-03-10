<template>
  <div class="w-full relative group">
    <label v-if="label" class="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 text-slate-500 dark:text-gray-400 group-focus-within:text-primary transition-colors">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :type="type"
        :class="[
          'w-full px-5 py-3.5 rounded-2xl transition-all duration-300',
          'bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10',
          'text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600',
          'focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-slate-50 dark:focus:bg-white/[0.05] focus:shadow-glow-primary',
          'hover:border-slate-300 dark:hover:border-white/20',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-black/20'
        ]"
        :disabled="disabled"
      />
      <!-- Bottom Accent Glow -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-500 group-focus-within:w-full opacity-50"></div>
    </div>
    <p v-if="error" class="text-danger-500 dark:text-danger-400 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  type?: string
  label?: string
  error?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
