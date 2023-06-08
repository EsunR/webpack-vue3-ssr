import createAppInstance from './main';
import 'normalize.css';

const {app, router, pinia} = createAppInstance();

pinia.state.value = (window as any).__PINIA_STATE__;

/**
 * 客户端挂载路由需要手动等待路由准备就绪
 * 否则会出现客户端激活路由时，路由还未准备就绪的情况
 */
router.isReady().then(() => {
    app.mount('#app');
});
