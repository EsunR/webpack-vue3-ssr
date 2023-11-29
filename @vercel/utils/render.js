"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSSR = void 0;
const devalue_1 = __importDefault(require("@nuxt/devalue"));
const server_renderer_1 = require("vue/server-renderer");
const log_1 = require("./log");
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
