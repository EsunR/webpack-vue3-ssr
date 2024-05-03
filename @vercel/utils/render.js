"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSSR = void 0;
const devalue_1 = __importDefault(require("@nuxt/devalue"));
const server_renderer_1 = require("vue/server-renderer");
const cache_1 = require("./cache");
const log_1 = require("./log");
function handleSSR(options) {
    return async (req, res, next) => {
        const { template } = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        if (!isCsr) {
            const startTime = new Date().valueOf();
            try {
                (0, log_1.log)('info', `${req.path} 触发服务端渲染`);
                await renderHTML(res, { req, ...options });
                (0, log_1.logMemoryUse)();
                next();
            }
            catch (error) {
                (0, log_1.log)('error', '服务端渲染失败\n', error);
                res.send(template);
                next();
            }
            finally {
                (0, log_1.log)('debug', `SSR 耗时 ${new Date().valueOf() - startTime}ms`);
            }
        }
        else {
            (0, log_1.log)('debug', `${req.path} 跳过服务端渲染`);
            res.send(template);
            next();
        }
    };
}
exports.handleSSR = handleSSR;
/** 创建服务端 Vue 实例，返回渲染好的渲染 HTML 内容 */
async function renderHTML(res, options) {
    const { req, createApp, clientWpStats } = options;
    const createAppResult = await createApp({
        req,
    });
    const { router } = createAppResult;
    const currentRoute = router.currentRoute.value;
    const ssrMeta = currentRoute.meta.ssr;
    // 判断是否禁用 SSR
    if (ssrMeta?.disable) {
        (0, log_1.log)('debug', `${req.path} meta 中显示禁用 SSR`);
        res.send(options.template);
        return;
    }
    // 获取 SSR 缓存
    const cacheInfo = ssrMeta?.cache;
    const enableCache = typeof cacheInfo?.enable === 'function' ? cacheInfo.enable(req) : !!cacheInfo?.enable;
    const cacheKey = typeof cacheInfo?.key === 'function' ? cacheInfo.key(req) : cacheInfo?.key ?? req.url;
    if (enableCache && cache_1.ssrCache.has(cacheKey)) {
        (0, log_1.log)('debug', `使用缓存的 SSR 页面, lru key ${cacheKey}`);
        res.setHeader('ssr-type', 'cache');
        res.send(cache_1.ssrCache.get(cacheKey));
        return;
    }
    // 添加 Preload link
    const currentPageChunkNames = currentRoute.matched
        .map(item => item.meta?.chunkNames)
        .filter(item => !!item)
        .flat();
    const preloadLinks = getPreloadLinkByChunkNames(currentPageChunkNames, clientWpStats);
    const ssrContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };
    if (ssrMeta?.stream) {
        await sendHtmlAsStream(res, options, createAppResult, preloadLinks, ssrContext);
    }
    else {
        await sendHtmlAsString(res, options, createAppResult, preloadLinks, ssrContext, currentRoute);
    }
}
async function sendHtmlAsString(res, renderOptions, createAppResult, preloadLinks, ssrContext, currentRoute) {
    const { template, req } = renderOptions;
    const { app, pinia } = createAppResult;
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
        // 创建 SSR 缓存
        const cacheInfo = currentRoute.meta?.ssr?.cache;
        const enableCache = typeof cacheInfo?.enable === 'function' ? cacheInfo.enable(req) : !!cacheInfo?.enable;
        const cacheKey = typeof cacheInfo?.key === 'function' ? cacheInfo.key(req) : cacheInfo?.key ?? req.url;
        if (enableCache) {
            (0, log_1.log)('debug', `创建 SSR 缓存, lru key ${cacheKey}`);
            cache_1.ssrCache.set(cacheKey, html, {
                ttl: cacheInfo.ttl,
            });
        }
        res.setHeader('ssr-type', 'string');
        res.send(html);
    }
    catch (error) {
        // @ts-ignore
        clearTimeout(timeout);
        throw error;
    }
}
function sendHtmlAsStream(res, renderOptions, createAppResult, preloadLinks, ssrContext) {
    return new Promise(resolve => {
        const { template } = renderOptions;
        const { app, pinia } = createAppResult;
        const stream = (0, server_renderer_1.renderToNodeStream)(app, ssrContext);
        const preHtml = template.split('<!-- app-html -->');
        preHtml[0] = preHtml[0]
            .replace('<!-- css-preload-links -->', `${preloadLinks.css}`)
            .replace('<!-- js-preload-links -->', `${preloadLinks.js}`);
        res.setHeader('ssr-type', 'stream');
        res.write(preHtml[0]);
        stream.pipe(res, { end: false });
        stream.on('end', () => {
            preHtml[1] = preHtml[1].replace('<!-- app-state -->', `<script>window.__INIT_STATE__ = ${(0, devalue_1.default)(pinia.state.value)}</script>`);
            res.write(preHtml[1]);
            res.end();
            resolve(null);
        });
    });
}
/**
 * 根据 chunk 名称生成 preload link
 * @param chunkNames webpack 打包后的 chunk 名
 * @param stats webpack 打包后的分析文件，记录了每个 chunk 的依赖关系
 */
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
        if (asset.endsWith('.js') && process.env.NODE_ENV !== 'development') {
            preloadLinks.js += `<link rel="preload" as="script" href="${asset}">`;
        }
    });
    return preloadLinks;
}
