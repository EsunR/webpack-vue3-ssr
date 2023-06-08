import {createRouter, RouteRecordRaw, createWebHistory, createMemoryHistory} from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home-page" */ '@/views/home/index.vue'),
    },
    {
        path: '/news',
        name: 'News',
        component: () => import(/* webpackChunkName: "news-page" */ '@/views/news/index.vue'),
    },
];

export function createRouterInstance() {
    const router = createRouter({
        routes,
        history: process.env.IS_NODE ? createMemoryHistory() : createWebHistory(),
    });
    return router;
}
