import App from '@/App.vue';
import {createRouterInstance} from '@/router';
import '@/styles/global.css';
import {createSSRApp} from 'vue';
import {createPinia} from 'pinia';

export default function createAppInstance() {
    const app = createSSRApp(App);

    const pinia = createPinia()
    app.use(pinia)

    const router = createRouterInstance();
    app.use(router);

    return {
        app,
        router,
        pinia,
    };
}
