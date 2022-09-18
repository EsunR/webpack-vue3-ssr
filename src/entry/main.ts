import {IS_NODE} from '@/utils/ssr';
import {createSSRApp, createApp} from 'vue';
import App from '@/App.vue';

export default function createAppInstance() {
    const app = IS_NODE ? createSSRApp(App) : createApp(App);

    return {
        app,
    };
}
