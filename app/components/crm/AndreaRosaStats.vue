<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <KpiCard
      title="Total de Casos"
      :value="stats.totalLeads"
      icon="ph:users-three-bold"
      color="info"
      :loading="loading"
    />
    <KpiCard
      title="Prioridade Alta"
      :value="stats.highUrgency"
      icon="ph:lightning-bold"
      color="warning"
      :loading="loading"
    />
    <KpiCard
      title="Satisfação"
      :value="`${stats.sentiment}% `"
      icon="ph:heart-bold"
      color="success"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import KpiCard from '../KpiCard.vue'

defineProps<{
  stats: {
    totalLeads: number;
    highUrgency: number;
    sentiment: number;
    conversionRate: number;
  };
  loading?: boolean;
}>()
</script>
