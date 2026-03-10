<template>
  <div class="bg-white dark:bg-slate-900/50 rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl">
    
    <!-- Component Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <!-- Icon -->
        <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Ranking de Vendedores - Histórico</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Estatísticas de vendas e atendimentos</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          v-if="hasHiddenSellers"
          @click="$emit('show-all')"
          class="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          Mostrar Ocultos
        </button>

        <button 
          @click="$emit('refresh')"
          class="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Atualizar
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-white/5">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
          <tr>
            <th scope="col" class="px-6 py-4 rounded-tl-xl w-24 text-center">#</th>
            <th scope="col" class="px-6 py-4">Vendedor</th>
            <th scope="col" class="px-6 py-4 text-center">Clientes At</th>
            <th scope="col" class="px-6 py-4 text-center">Vendas</th>
            <th scope="col" class="px-6 py-4 text-center">Conversão</th>
            <th scope="col" class="px-6 py-4">Valor Total</th>
            <th scope="col" class="px-4 py-4 rounded-tr-xl w-12 text-center text-transparent">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
          <tr 
            v-for="(seller, index) in ranking" 
            :key="seller.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
          >
            <!-- Rank Badge -->
            <td class="px-6 py-4 text-center">
              <div 
                v-if="index === 0" 
                class="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30"
                title="1º Lugar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" /></svg>
              </div>
              <div 
                v-else-if="index === 1" 
                class="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-400 text-white flex items-center justify-center mx-auto shadow-md"
                title="2º Lugar"
              >
                <span class="font-bold">2</span>
              </div>
              <div 
                v-else-if="index === 2" 
                class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20"
                title="3º Lugar"
              >
                <span class="font-bold">3</span>
              </div>
              <div v-else class="text-slate-900 dark:text-white font-bold group-hover:text-primary transition-colors">
                {{ index + 1 }}
              </div>
            </td>

            <!-- Name -->
            <td class="px-6 py-4 font-bold text-slate-900 dark:text-white capitalize">
              {{ seller.nome }}
            </td>

            <!-- Clients Served -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-3 py-1 rounded-full text-xs">
                {{ seller.clientes }}
              </span>
            </td>

            <!-- Sales -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center font-bold text-slate-800 dark:text-slate-200">
                {{ seller.vendas }}
              </span>
            </td>

            <!-- Conversion Rate -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center font-bold text-slate-800 dark:text-slate-200">
                {{ seller.conversao.toFixed(1) }}%
              </span>
            </td>

            <!-- Revenue -->
            <td class="px-6 py-4">
              <span 
                class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold"
                :class="seller.valor > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
              >
                {{ formatCurrency(seller.valor) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-4 text-center">
              <button 
                @click="$emit('hide', seller.id)"
                class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Ocultar funcionário"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </td>
          </tr>
          
          <!-- Empty State -->
          <tr v-if="ranking.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              Nenhum dado encontrado para o período selecionado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  ranking: Array<{
    id: string | number;
    nome: string;
    vendas: number;
    valor: number;
    clientes: number;
    conversao: number;
  }>;
  hasHiddenSellers?: boolean;
}>()

// Emits
defineEmits<{
  (e: 'refresh'): void;
  (e: 'hide', sellerId: string | number): void;
  (e: 'show-all'): void;
}>()

// Helpers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
