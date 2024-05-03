import devalue from '@nuxt/devalue';
import {NextFunction, Request, Response} from 'express';
import {RouteLocationNormalizedLoaded, Router} from 'vue-router';
import {renderToNodeStream, renderToString} from 'vue/server-renderer';
import {CreateAppResult, IHandleSSROptions, IPreloadLinks, IRenderHTMLOptions, IWebpackStats} from '../types';
import {ssrCache} from './cache';
import {log, logMemoryUse} from './log';

export function handleSSR(options: IHandleSSROptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template} = options;
        const isCsr = /(is)?_?csr/.test(req.url);

        if (!isCsr) {
            const startTime = new Date().valueOf();
            try {
                log('info', `${req.path} 触发服务端渲染`);
                await renderHTML(res, {req, ...options});
                logMemoryUse();
                next();
            } catch (error) {
                log('error', '服务端渲染失败\n', error);
                res.send(template);
                next();
            } finally {
                log('debug', `SSR 耗时 ${new Date().valueOf() - startTime}ms`);
            }
        } else {
            log('debug', `${req.path} 跳过服务端渲染`);
            res.send(template);
            next();
        }
    };
}

/** 创建服务端 Vue 实例，返回渲染好的渲染 HTML 内容 */
async function renderHTML(res: Response, options: IRenderHTMLOptions) {
    const {req, createApp, clientWpStats} = options;

    const createAppResult = await createApp({
        req,
    });

    const {router} = createAppResult;

    const currentRoute = (router as Router).currentRoute.value;
    const ssrMeta = currentRoute.meta.ssr as any;

    // 判断是否禁用 SSR
    if (ssrMeta?.disable) {
        log('debug', `${req.path} meta 中显示禁用 SSR`);
        res.send(options.template);
        return;
    }

    // 获取 SSR 缓存
    const cacheInfo = ssrMeta?.cache as any;
    const enableCache = typeof cacheInfo?.enable === 'function' ? cacheInfo.enable(req) : !!cacheInfo?.enable;
    const cacheKey = typeof cacheInfo?.key === 'function' ? cacheInfo.key(req) : cacheInfo?.key ?? req.url;
    if (enableCache && ssrCache.has(cacheKey)) {
        log('debug', `使用缓存的 SSR 页面, lru key ${cacheKey}`);
        res.setHeader('ssr-type', 'cache');
        res.send(ssrCache.get(cacheKey));
        return;
    }

    // 添加 Preload link
    const currentPageChunkNames = currentRoute.matched
        .map(item => item.meta?.chunkNames as string[])
        .filter(item => !!item)
        .flat();
    const preloadLinks = getPreloadLinkByChunkNames(currentPageChunkNames, clientWpStats);
    const ssrContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };

    if (ssrMeta?.stream) {
        await sendHtmlAsStream(res, options, createAppResult, preloadLinks, ssrContext);
    } else {
        await sendHtmlAsString(res, options, createAppResult, preloadLinks, ssrContext, currentRoute);
    }
}

async function sendHtmlAsString(
    res: Response,
    renderOptions: IRenderHTMLOptions,
    createAppResult: CreateAppResult,
    preloadLinks: IPreloadLinks,
    ssrContext: any,
    currentRoute: RouteLocationNormalizedLoaded
) {
    const {template, req} = renderOptions;
    const {app, pinia} = createAppResult;

    let timeout: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => {
            clearTimeout(timeout);
            reject(new Error('SSR 超时'));
        }, 5000);
    });

    const renderPromise = renderToString(app, ssrContext);

    try {
        const appContent = await Promise.race([renderPromise, timeoutPromise]);
        // @ts-ignore
        clearTimeout(timeout);
        const html = template
            .replace('<!-- css-preload-links -->', `${preloadLinks.css}`)
            .replace('<!-- js-preload-links -->', `${preloadLinks.js}`)
            .replace('<!-- app-html -->', `${appContent}`)
            .replace('<!-- app-state -->', `<script>window.__INIT_STATE__ = ${devalue(pinia.state.value)}</script>`);

        // 创建 SSR 缓存
        const cacheInfo = (currentRoute.meta as any)?.ssr?.cache as any;
        const enableCache = typeof cacheInfo?.enable === 'function' ? cacheInfo.enable(req) : !!cacheInfo?.enable;
        const cacheKey = typeof cacheInfo?.key === 'function' ? cacheInfo.key(req) : cacheInfo?.key ?? req.url;
        if (enableCache) {
            log('debug', `创建 SSR 缓存, lru key ${cacheKey}`);
            ssrCache.set(cacheKey, html, {
                ttl: cacheInfo.ttl,
            });
        }

        res.setHeader('ssr-type', 'string');
        res.send(html);
    } catch (error) {
        // @ts-ignore
        clearTimeout(timeout);
        throw error;
    }
}

function sendHtmlAsStream(
    res: Response,
    renderOptions: IRenderHTMLOptions,
    createAppResult: CreateAppResult,
    preloadLinks: IPreloadLinks,
    ssrContext: any
) {
    return new Promise(resolve => {
        const {template} = renderOptions;
        const {app, pinia} = createAppResult;

        const stream = renderToNodeStream(app, ssrContext);

        const preHtml = template.split('<!-- app-html -->');

        preHtml[0] = preHtml[0]
            .replace('<!-- css-preload-links -->', `${preloadLinks.css}`)
            .replace('<!-- js-preload-links -->', `${preloadLinks.js}`);

        res.setHeader('ssr-type', 'stream');
        res.write(preHtml[0]);
        stream.pipe(res, {end: false});
        stream.on('end', () => {
            preHtml[1] = preHtml[1].replace(
                '<!-- app-state -->',
                `<script>window.__INIT_STATE__ = ${devalue(pinia.state.value)}</script>`
            );
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
function getPreloadLinkByChunkNames(chunkNames: string[], stats: IWebpackStats): IPreloadLinks {
    // 获取到 webpack 中配置的 publicPath
    const PUBLIC_PATH = stats.publicPath as string;
    const cssAssets: string[] = [];
    const jsAssets: string[] = [];
    chunkNames.forEach(name => {
        const currentCssAssets: string[] = [];
        const currentJsAssets: string[] = [];
        //  根据具名子包，查询到所依赖的资源
        stats.namedChunkGroups[name]?.assets.forEach(item => {
            if (item.name.endsWith('.css')) {
                currentCssAssets.push(`${PUBLIC_PATH}${item.name}`);
            } else if (item.name.endsWith('.js')) {
                currentJsAssets.push(`${PUBLIC_PATH}${item.name}`);
            }
        });
        cssAssets.push(...currentCssAssets);
        jsAssets.push(...currentJsAssets);
    });

    // 资源去重
    const assets = Array.from(new Set([...cssAssets, ...jsAssets]));

    // 生成资源标签
    const preloadLinks: IPreloadLinks = {
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
