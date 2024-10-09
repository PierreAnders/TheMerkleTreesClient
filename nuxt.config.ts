// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  plugins: [
    '~/plugins/web3.js',
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
