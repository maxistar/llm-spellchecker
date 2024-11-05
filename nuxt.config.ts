// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv';
dotenv.config();

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET,
  }
})
