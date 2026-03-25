export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['vue-email/module'],

  vueEmail: {
    autoImport: true,
    preview: {
      enabled: true,
      previewRoute: '/__vue-email-preview',
      title: 'Vue Email Nuxt 示例',
    },
    resend: {
      from: 'Vue Email <onboarding@resend.dev>',
      retry: {
        enabled: true,
        maxRetries: 3,
      },
      logging: {
        enabled: false,
        level: 'error',
      },
    },
  },

  runtimeConfig: {
    public: {
      vueEmail: {
        previewEnabled: true,
      },
    },
  },
})
