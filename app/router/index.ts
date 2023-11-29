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
        meta: {
            chunkNames: ['home-page'],
        },
    },
    {
        path: '/news',
        name: 'News',
        component: () => import(/* webpackChunkName: "news-page" */ '@/views/news/index.vue'),
        meta: {
            chunkNames: ['news-page'],
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
