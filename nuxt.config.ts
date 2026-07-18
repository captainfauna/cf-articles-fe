import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    '~/assets/stylesheets/main.css',
    '@vuepic/vue-datepicker/dist/main.css'
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      titleTemplate: '%s',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#155DFC' },
        { property: 'og:site_name', content: 'Captain Fauna' },
        { property: 'og:locale', content: 'id_ID' },
        { name: 'twitter:site', content: '@captainfauna' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      apiArticleUrl: '',
      imageBaseUrl: '',
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
    ['@nuxtjs/google-fonts', {
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
