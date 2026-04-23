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
        { name: 'description', content: 'Sistema de Gestão Previdenciária — Andréa Rosa Advocacia Previdenciária' },
        { name: 'theme-color', content: '#7B2332' },
        // Open Graph (WhatsApp, Telegram, LinkedIn, Facebook)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Andréa Rosa Advocacia' },
        { property: 'og:title', content: 'Andréa Rosa Advocacia Previdenciária' },
        { property: 'og:description', content: 'Sistema de Gestão Previdenciária — Andréa Rosa Advocacia Previdenciária' },
        { property: 'og:image', content: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://crm.andrearosaadvocacia.blog'}/logo-andrea-rosa-white.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Andréa Rosa Advocacia Previdenciária' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Andréa Rosa Advocacia Previdenciária' },
        { name: 'twitter:description', content: 'Sistema de Gestão Previdenciária — Andréa Rosa Advocacia Previdenciária' },
        { name: 'twitter:image', content: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://crm.andrearosaadvocacia.blog'}/logo-andrea-rosa-white.png` },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/logo-andrea-rosa-white-removebg-preview.ico' },
        { rel: 'shortcut icon', href: '/logo-andrea-rosa-white-removebg-preview.ico' },
        { rel: 'apple-touch-icon', href: '/logo-andrea-rosa.png' }
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
          src: '/logo-andrea-rosa.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/logo-andrea-rosa.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/logo-andrea-rosa-white.png',
          sizes: 'any',
          type: 'image/png',
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