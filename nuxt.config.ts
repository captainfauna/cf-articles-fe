import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    '~/assets/stylesheets/main.css',
    '@vuepic/vue-datepicker/dist/main.css'
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      apiArticleUrl: '',
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    'nuxt-keen-slider',
    '@nuxt/icon',
    ['@nuxtjs/google-fonts',  {
      families: {
        'Lato': [300, 400, 700],
        'Paytone One': [400],
        'Bitter': [400, 600, 700],
      },
      display: 'swap',
      preconnect: true,
      preload: true,
    }]
  ]
})

