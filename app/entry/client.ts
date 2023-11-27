import createAppInstance from './main';
import 'normalize.css';

const {app, router, pinia} = createAppInstance();

if (window.__INIT_STATE__) {
    pinia.state.value = window.__INIT_STATE__;
}

/**
 * 客户端挂载路由需要手动等待路由准备就绪
 * 否则会出现客户端激活路由时，路由还未准备就绪的情况
 */
router.isReady().then(() => {
    app.mount('#app');
});
