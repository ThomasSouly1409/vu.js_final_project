import { createRouter, createWebHistory } from 'vue-router'
import Home from './src/pages/Home.vue'
import { path } from 'express/lib/application'
import List from '@/pages/List.vue'
import VisitList from '@/pages/VisitList.vue'

const routes = [
    { path: '/Home', component: Home},
    { path: '/List', component: List},
    { path: '/VisitList', component: VisitList},
]

export const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})