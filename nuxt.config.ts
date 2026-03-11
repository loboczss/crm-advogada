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
      title: 'Evastur Cloud',
      meta: [
        { name: 'description', content: 'Plataforma inteligente de CRM e gestão Evastur' },
        { name: 'theme-color', content: '#2f81f7' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-white.svg' },
        { rel: 'apple-touch-icon', href: '/icon-white.svg' }
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
      background_color: '#ffffff',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-white.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ],
      start_url: '/',
      display: 'standalone'
    },
    workbox: {
      navigateFallback: '/',
      // Limit globPatterns to files that actually exist in public/ during build
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/]
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