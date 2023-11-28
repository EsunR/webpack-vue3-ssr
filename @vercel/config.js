"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROXIES = exports.NO_MATCH_SSR_REG = exports.SSR_SERVER_PORT = exports.USE_MFS = void 0;
/**
 * Dev 模式下的构建产出是否放在内存中，如果为 false，则会放在磁盘中
 */
exports.USE_MFS = true;
exports.SSR_SERVER_PORT = 8090;
exports.NO_MATCH_SSR_REG = /^\/(auth|api|static|proxy|openapi|nodeapi|__webpack_hmr|hot-update)\/?|\.(map|png|json|svg|jpg|ico(\?.*)?|js|css)$/i;
exports.PROXIES = {
    dev: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: { '^/rsshub': '' },
            changeOrigin: true,
        },
    },
    preonline: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: { '^/rsshub': '' },
            changeOrigin: true,
        },
    },
    online: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: { '^/rsshub': '' },
            changeOrigin: true,
        },
    },
};
