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
      title: 'Andréa Rosa Advocacia',
      meta: [
        { name: 'description', content: 'Sistema de Gestão Previdenciária Andréa Rosa' },
        { name: 'theme-color', content: '#7B2332' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-andrea-rosa.svg' },
        { rel: 'apple-touch-icon', href: '/icon-andrea-rosa-192.png' }
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
      name: 'Andréa Rosa CRM',
      short_name: 'Andréa Rosa',
      description: 'Sistema de Gestão Previdenciária Andréa Rosa',
      theme_color: '#7B2332',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icon-andrea-rosa-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-andrea-rosa-192.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-andrea-rosa-white.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ],
      start_url: '/',
      display: 'standalone'
    },
    workbox: {
      // Limit globPatterns to files that actually exist in public/ during build
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: false,
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
      exclude: ['/', '/recovery', '/privacidade', '/auth/dropbox'],
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
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    mailerSenderEmail: process.env.MAILER_SENDER_EMAIL ?? '',
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      originalSiteUrl: process.env.NUXT_PUBLIC_ORIGINAL_SITE_URL ?? '',
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseKey: process.env.SUPABASE_KEY ?? '',
    },
  },
  nitro: {
    // Prevent Nitro from bundling CJS-only packages — they generate
    // invalid Windows absolute paths ('d:/...') in the ESM bundle
    externals: {
      external: ['pdf-parse', 'xlsx'],
    },
  },
})