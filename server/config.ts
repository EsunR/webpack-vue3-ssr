import {Options} from 'http-proxy-middleware';

/**
 * Dev 模式下的构建产出是否放在内存中，如果为 false，则会放在磁盘中
 */
export const USE_MFS = true;

export const SSR_SERVER_PORT = 8090;

export const NO_MATCH_SSR_REG = /^\/(auth|api|static|proxy|openapi|nodeapi|__webpack_hmr|hot-update)\/?|\.(map|png|json|svg|jpg|ico(\?.*)?|js|css)$/i;

export const PROXIES: {[env: string]: {[path: string]: Options}} = {
    dev: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: {'^/rsshub': ''},
            changeOrigin: true,
        },
    },
    preonline: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: {'^/rsshub': ''},
            changeOrigin: true,
        },
    },
    online: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: {'^/rsshub': ''},
            changeOrigin: true,
        },
    },
};
