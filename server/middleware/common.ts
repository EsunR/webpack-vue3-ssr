import express, {Express} from 'express';
import {createProxyMiddleware, fixRequestBody} from 'http-proxy-middleware';
import {PROXIES} from '../config';
import {log} from '../utils/log';
import path from 'path';

const APP_ENV = process.env.APP_ENV || 'dev';

export default function commonMiddleware(app: Express) {
    app.enable('trust proxy');

    app.use(
        express.static(path.resolve(__dirname, 'client'), {
            index: false,
        })
    );

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
                    log('debug', `[Node Proxy] 请求代理: ${req?.url} => ${option.target}`);
                    return fixRequestBody(proxyReq, req);
                },
                onError: err => {
                    log('error', `[Node Proxy] onError:\n${err}`);
                },
            })
        );
    });
}
