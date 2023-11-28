/******/ var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(2));
const fs_1 = __importDefault(__webpack_require__(3));
const path_1 = __importDefault(__webpack_require__(4));
const config_1 = __webpack_require__(5);
const common_1 = __importDefault(__webpack_require__(6));
const render_1 = __webpack_require__(12);
const CLIENT_PATH = 'client';
const SERVER_PATH = 'server';
const app = (0, express_1.default)();
const serverManifest = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, SERVER_PATH, 'manifest.json'), 'utf-8'));
const clientTemplate = fs_1.default.readFileSync(path_1.default.resolve(__dirname, CLIENT_PATH, 'index.html'), 'utf-8');
const clientWpStats = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, CLIENT_PATH, 'stats.json'), 'utf-8'));
const mainJsPath = path_1.default.resolve(__dirname, SERVER_PATH, serverManifest['main.js']);
// @ts-ignore
const createApp = __webpack_require__(15)(mainJsPath).default;
(0, common_1.default)(app);
app.get('*', async (req, res, next) => {
    if (config_1.NO_MATCH_SSR_REG.exec(req.url)) {
        next();
        return;
    }
    (0, render_1.handleSSR)({ template: clientTemplate, createApp, clientWpStats })(req, res, next);
});
exports["default"] = app;


/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
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


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __importDefault(__webpack_require__(2));
const http_proxy_middleware_1 = __webpack_require__(7);
const config_1 = __webpack_require__(5);
const log_1 = __webpack_require__(8);
const APP_ENV = process.env.APP_ENV || 'dev';
function commonMiddleware(app) {
    app.enable('trust proxy');
    app.use(express_1.default.static(process.env.VERCEL ? 'vercelDist/client' : 'client', {
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
exports["default"] = commonMiddleware;


/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("http-proxy-middleware");

/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logMemoryUse = exports.log = void 0;
const chalk_1 = __importDefault(__webpack_require__(9));
const dayjs_1 = __importDefault(__webpack_require__(10));
const utc_1 = __importDefault(__webpack_require__(11));
dayjs_1.default.extend(utc_1.default);
function log(logType, message, ...rest) {
    let prefix = '';
    switch (logType) {
        case 'warn':
            prefix = chalk_1.default.black.bgYellow('WARN');
            break;
        case 'error':
            prefix = chalk_1.default.white.bgRed('ERROR');
            break;
        case 'success':
            prefix = chalk_1.default.black.bgGreen('SUCCESS');
            break;
        case 'info':
            prefix = chalk_1.default.black.bgBlue('INFO');
            break;
        case 'debug':
        default:
            prefix = chalk_1.default.black.bgWhite('DEBUG');
            break;
    }
    console.log(`[${(0, dayjs_1.default)().utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}]`, prefix, message, ...rest);
}
exports.log = log;
let FIRST_LOG_RSS_MEMORY_VALUE = 0;
function logMemoryUse() {
    const used = process.memoryUsage();
    const messages = [];
    let currentRSSMemoryValue = 0;
    for (const key in used) {
        const memoryValue = Math.round((used[key] / 1024 / 1024) * 100) / 100;
        messages.push(`${key}: ${memoryValue} MB`);
        if (key === 'rss') {
            currentRSSMemoryValue = memoryValue;
            if (FIRST_LOG_RSS_MEMORY_VALUE === 0) {
                FIRST_LOG_RSS_MEMORY_VALUE = currentRSSMemoryValue;
            }
        }
    }
    log('debug', '[MemoryLog] 内存占用情况：', messages.join(', '));
    log('debug', '[MemoryLog] RSS 内存浮动' + Number.parseFloat((currentRSSMemoryValue - FIRST_LOG_RSS_MEMORY_VALUE).toFixed(2)) + ' MB');
}
exports.logMemoryUse = logMemoryUse;


/***/ }),
/* 9 */
/***/ ((module) => {

"use strict";
module.exports = require("chalk");

/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("dayjs");

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = require("dayjs/plugin/utc");

/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handleSSR = void 0;
const devalue_1 = __importDefault(__webpack_require__(13));
const server_renderer_1 = __webpack_require__(14);
const log_1 = __webpack_require__(8);
function getPreloadLinkByChunkNames(chunkNames, stats) {
    // 获取到 webpack 中配置的 publicPath
    const PUBLIC_PATH = stats.publicPath;
    const cssAssets = [];
    const jsAssets = [];
    chunkNames.forEach(name => {
        const currentCssAssets = [];
        const currentJsAssets = [];
        //  根据具名子包，查询到所依赖的资源
        stats.namedChunkGroups[name]?.assets.forEach(item => {
            if (item.name.endsWith('.css')) {
                currentCssAssets.push(`${PUBLIC_PATH}${item.name}`);
            }
            else if (item.name.endsWith('.js')) {
                currentJsAssets.push(`${PUBLIC_PATH}${item.name}`);
            }
        });
        cssAssets.push(...currentCssAssets);
        jsAssets.push(...currentJsAssets);
    });
    // 资源去重
    const assets = Array.from(new Set([...cssAssets, ...jsAssets]));
    // 生成资源标签
    const preloadLinks = {
        css: '',
        js: '',
    };
    assets.forEach(asset => {
        if (asset.endsWith('.css')) {
            preloadLinks.css +=
                `<link rel="preload" as="style" href="${asset}">` +
                    `<link rel="stylesheet" as="style" href="${asset}">`;
        }
        if (asset.endsWith('.js')) {
            preloadLinks.js += `<link rel="preload" as="script" href="${asset}">`;
        }
    });
    return preloadLinks;
}
function handleSSR(options) {
    return async (req, res, next) => {
        const { template } = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;
        if (!isCsr) {
            const startTime = new Date().valueOf();
            try {
                (0, log_1.log)('info', `${req.path} 触发服务端渲染`);
                html = await renderHTML({ req, ...options });
                (0, log_1.logMemoryUse)();
            }
            catch (error) {
                (0, log_1.log)('error', '服务端渲染失败\n', error);
            }
            finally {
                (0, log_1.log)('debug', `SSR 耗时 ${new Date().valueOf() - startTime}ms`);
            }
        }
        else {
            (0, log_1.log)('debug', `${req.path} 跳过服务端渲染`);
        }
        res.send(html);
        next();
    };
}
exports.handleSSR = handleSSR;
async function renderHTML(options) {
    const { template, req, createApp, clientWpStats } = options;
    const { app, pinia, router } = await createApp({
        req,
    });
    const currentPageChunkNames = router.currentRoute.value.matched
        .map(item => item.meta?.chunkNames)
        .filter(item => !!item)
        .flat();
    const preloadLinks = getPreloadLinkByChunkNames(currentPageChunkNames, clientWpStats);
    const ssrContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };
    let timeout;
    const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => {
            clearTimeout(timeout);
            reject(new Error('SSR 超时'));
        }, 5000);
    });
    const renderPromise = (0, server_renderer_1.renderToString)(app, ssrContext);
    try {
        const appContent = await Promise.race([renderPromise, timeoutPromise]);
        // @ts-ignore
        clearTimeout(timeout);
        const html = template
            .replace('<!-- css-preload-links -->', `${preloadLinks.css}`)
            .replace('<!-- js-preload-links -->', `${preloadLinks.js}`)
            .replace('<!-- app-html -->', `${appContent}`)
            .replace('<!-- app-state -->', `<script>window.__INIT_STATE__ = ${(0, devalue_1.default)(pinia.state.value)}</script>`);
        return html;
    }
    catch (error) {
        // @ts-ignore
        clearTimeout(timeout);
        throw error;
    }
}


/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";
module.exports = require("@nuxt/devalue");

/***/ }),
/* 14 */
/***/ ((module) => {

"use strict";
module.exports = require("vue/server-renderer");

/***/ }),
/* 15 */
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 15;
module.exports = webpackEmptyContext;

/***/ })
/******/ ]);
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module is referenced by other modules so it can't be inlined
/******/ var __webpack_exports__ = __webpack_require__(1);
/******/ module.exports = __webpack_exports__["default"];
/******/ 
