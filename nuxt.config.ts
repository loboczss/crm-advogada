/// <reference path="./nuxt.schema.d.ts" />
// https://nuxt.com/docs/api/configuration/nuxt-config
import type { } from './nuxt.schema'
import image from './config/nuxt-image'
import llms from './config/nuxt-llms'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      title: 'Evastur - CRM & Sales',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-white.svg' }
      ]
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    // '@nuxt/image',
    '@nuxtjs/supabase',
    'nuxt-llms',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
  ],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Evastur CRM',
      short_name: 'Evastur',
      description: 'Plataforma inteligente de CRM e gestão Evastur',
      theme_color: '#2f81f7',
      icons: [
        {
          src: '/icon-blue.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: '/icon-blue.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ],
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff'
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    exposeConfig: true,
  },
  // image,
  llms,
  supabase: {
    types: '@@/shared/types/database.types.ts',
    useSsrCookies: true,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/recovery', '/privacidade'],
      saveRedirectToCookie: false
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: true
    }
  },
  runtimeConfig: {
    // Private — server-side only
    n8nRagWebhookUrl: process.env.N8N_RAG_WEBHOOK_URL ?? '',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  },
  nitro: {
    // Prevent Nitro from bundling CJS-only packages — they generate
    // invalid Windows absolute paths ('d:/...') in the ESM bundle
    externals: {
      external: ['pdf-parse', 'xlsx'],
    },
  },
})