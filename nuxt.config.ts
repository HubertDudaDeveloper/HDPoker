// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  app: {
    baseURL: "/poker/",
  },
  router: {
    base: '/poker/'
  },
  modules: ["@pinia/nuxt"],
  nitro: {
    experimental: {
      websocket: true,
    },
    preset: "static",
  },
  ssr: false,
  target: 'static'
});
