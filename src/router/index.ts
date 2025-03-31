import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/pages/ImageGenerator.vue') },
  { path: '/login', component: () => import('@/pages/Auth.vue') }
]

const router = createRouter({
  history: createWebHistory("/design"),
  routes,
})

export default router