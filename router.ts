import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import List from '@/pages/List.vue'

const routes = [
  { path: '/home', component: Home },
  { path: '/list', component: List },
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})