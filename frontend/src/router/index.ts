import { defineRouter } from '@quasar/app-vite'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes.ts'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = import.meta.env.SSR
    ? createMemoryHistory
    : (import.meta.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.VUE_ROUTER_BASE)
  })

  return Router
})
