// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  components: [
    {
      path: '@/components',
      pathPrefix: false,
    },
  ],

  css: [
    '@/assets/css/global.css',
  ],

})
