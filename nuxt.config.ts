// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  app: {
    baseURL: '/poker/',
  },
  modules: ['@pinia/nuxt'],
  nitro: {
    experimental: {
      websocket: true
    }
  }
})