import {createRouter, RouteRecordRaw, createWebHistory, createMemoryHistory} from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/home',
        name: 'HomeIndex',
        component: () => import(/* webpackChunkName: "HomeIndex" */ '@/views/home/index.vue'),
        meta: {
            chunkNames: ['HomeIndex'],
        },
    },
    {
        path: '/news',
        name: 'NewsIndex',
        component: () => import(/* webpackChunkName: "NewsIndex" */ '@/views/news/index.vue'),
        meta: {
            chunkNames: ['NewsIndex'],
            ssrCache: {
                enable: true,
                key: '/news',
                ttl: 60 * 60 * 1000, // 1 hour
            },
        },
    },
];

export function createRouterInstance() {
    const router = createRouter({
        routes,
        history: process.env.IS_NODE ? createMemoryHistory() : createWebHistory(),
    });
    return router;
}
