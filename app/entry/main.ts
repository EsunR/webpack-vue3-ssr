import App from '@/App.vue';
import {createRouterInstance} from '@/router';
import '@/styles/global.css';
import {createApp, createSSRApp} from 'vue';
import {createPinia} from 'pinia';
import {IS_NODE} from '@/utils/ssr';

export default function createAppInstance() {
    const needHydration = !IS_NODE && !!window.__INIT_STATE__;
    // 如果服务端渲染失败或者跳过渲染，就使用 createApp 创建客户端实例
    const app = needHydration ? createSSRApp(App) : createApp(App);

    const pinia = createPinia();
    app.use(pinia);

    const router = createRouterInstance();
    app.use(router);

    return {
        app,
        router,
        pinia,
    };
}
