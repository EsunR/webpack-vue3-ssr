import {Options} from 'http-proxy-middleware';

export const SSR_SERVER_PORT = 8090;

export const PROXIES: {[env: string]: {[path: string]: Options}} = {
    dev: {
        '/rsshub': {
            target: 'https://rsshub.app',
            pathRewrite: {'^/rsshub': ''},
            changeOrigin: true,
        },
    },
    preonline: {},
    online: {},
};
