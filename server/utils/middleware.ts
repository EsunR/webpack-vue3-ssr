import {Express} from 'express';
import {createProxyMiddleware, fixRequestBody} from 'http-proxy-middleware';
import {PROXIES} from '../config';
import {log} from './log';

const APP_ENV = process.env.APP_ENV || 'dev';

export default function (app: Express) {
    app.enable('trust proxy');

    const needProxyPaths = Object.keys(PROXIES[APP_ENV] || {});
    needProxyPaths?.forEach(path => {
        const option = PROXIES[APP_ENV][path];
        app.use(
            path,
            createProxyMiddleware({
                ...option,
                timeout: 5 * 1000,
                logLevel: 'error',
                onProxyReq(proxyReq, req) {
                    log('info', `[Node Proxy] onProxyReq: ${req?.url} => ${option.target}`);
                    return fixRequestBody(proxyReq, req);
                },
                onError: err => {
                    log('error', `[Node Proxy] onError:\n${err}`);
                },
            })
        );
    });
}
