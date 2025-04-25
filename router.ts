import { createRouter, createWebHistory } from 'vue-router'
import Home from './src/pages/Home.vue'
import { path } from 'express/lib/application'

const routes = [
    { path: '/Home', component: Home},
]

export const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})