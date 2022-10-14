import App from '@/App.vue';
import '@/styles/global.css';
import {createSSRApp} from 'vue';

export default function createAppInstance() {
    const app = createSSRApp(App);

    return {
        app,
    };
}
