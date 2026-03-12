<template>
  <footer class="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-white/5 py-12 transition-all duration-300">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        
        <!-- Branding & Description -->
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <img src="/logo-blue.svg" alt="Evastur" class="h-8 w-auto dark:hidden select-none" />
            <img src="/logo-white.svg" alt="Evastur" class="h-8 w-auto hidden dark:block select-none" />
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            Potencializando a gestão comercial com inteligência e inovação. A Evastur Cloud é a solução completa para o crescimento do seu negócio.
          </p>
        </div>

        <!-- Details -->
        <div class="space-y-6">
          <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Empresa</h4>
          <div class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <p class="flex items-start gap-3">
              <Icon name="ph:buildings-bold" class="w-5 h-5 shrink-0 text-primary" />
              <span>
                <strong>EVASTUR AGÊNCIA DE VIAGENS LTDA</strong><br />
                CNPJ: 01.444.287/0001-01
              </span>
            </p>
            <p class="flex items-start gap-3">
              <Icon name="ph:map-pin-bold" class="w-5 h-5 shrink-0 text-primary" />
              <span>
                Avenida Joaquim Távora, nº 213, Box 2<br />
                Centro, Cruzeiro do Sul – AC, 69.980-000
              </span>
            </p>
          </div>
        </div>

        <!-- Contact & Links -->
        <div class="space-y-6">
          <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Contato</h4>
          <div class="space-y-3 text-sm">
            <a href="mailto:contato@evastur.com" class="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
              <Icon name="ph:envelope-simple-bold" class="w-5 h-5 text-primary" />
              contato@evastur.com
            </a>
            <div class="pt-4 flex items-center gap-6">
              <NuxtLink to="/privacidade" class="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest italic">
                Política de Privacidade
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © {{ new Date().getFullYear() }} Evastur Cloud • Todos os direitos reservados
        </p>
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Sistema Online</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Global footer component
</script>
