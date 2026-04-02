import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      mailServiceId: '',
      mailTemplateId: '',
      mailPublicKey: '',
      url: '',
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'slide-bottom', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'fr',
      },
      title: 'Declic - Dépistage anonyme des addictions',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            "Plateforme anonyme de dépistage et d'orientation vers le soutien en matière d'addictions pour les étudiants.",
        },
      ],
    },
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  css: ['./app/assets/css/main.css'],
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
        weights: [400, 500, 600, 700],
      },
      {
        name: 'Poppins',
        provider: 'google',
        weights: [400, 500, 600, 700],
      },
    ],
  },
  icon: {
    mode: 'svg',
    provider: 'none',
    clientBundle: {
      scan: true,
      // Icons from survey-config.json (not detected by scan since they're in a data file)
      icons: [
        'lucide:wine',
        'lucide:cigarette',
        'lucide:leaf',
        'lucide:pill',
        'lucide:sparkles',
        'lucide:smartphone',
        'lucide:gamepad-2',
        'lucide:dice-5',
        'lucide:heart',
        'lucide:cookie',
        'lucide:briefcase',
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
