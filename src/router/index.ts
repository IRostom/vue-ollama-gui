import ChatView from '@/components/ChatView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: ChatView },
  { path: '/:id', component: ChatView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
