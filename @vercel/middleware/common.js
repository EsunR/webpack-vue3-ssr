"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const config_1 = require("../config");
const log_1 = require("../utils/log");
const path_1 = __importDefault(require("path"));
const APP_ENV = process.env.APP_ENV || 'dev';
function commonMiddleware(app) {
    app.enable('trust proxy');
    const vercelStaticPath = path_1.default.resolve(__dirname, '../client');
    (0, log_1.log)('debug', `vercelStaticPath: ${vercelStaticPath}`);
    app.use(express_1.default.static(process.env.VERCEL ? vercelStaticPath : 'client', {
        index: false,
    }));
    const needProxyPaths = Object.keys(config_1.PROXIES[APP_ENV] || {});
    needProxyPaths?.forEach(path => {
        const option = config_1.PROXIES[APP_ENV][path];
        app.use(path, (0, http_proxy_middleware_1.createProxyMiddleware)({
            ...option,
            timeout: 5 * 1000,
            logLevel: 'error',
            onProxyReq(proxyReq, req) {
                (0, log_1.log)('debug', `[Node Proxy] 请求代理: ${req?.url} => ${option.target}`);
                return (0, http_proxy_middleware_1.fixRequestBody)(proxyReq, req);
            },
            onError: err => {
                (0, log_1.log)('error', `[Node Proxy] onError:\n${err}`);
            },
        }));
    });
}
exports.default = commonMiddleware;
