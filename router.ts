import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import List from '@/pages/List.vue'
import VisitList from '@/pages/VisitList.vue'
import App from '@/App.vue'
import Sidebar from '@/components/Sidebar.vue'

const routes = [
  { path: '/home', component: Home },
  { path: '/list', component: List },
  { path: '/visitlist', component: VisitList },
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})