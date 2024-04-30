import devalue from '@nuxt/devalue';
import {NextFunction, Request, Response} from 'express';
import {Router} from 'vue-router';
import {renderToString} from 'vue/server-renderer';
import {IHandleSSROptions, IPreloadLinks, IRenderHTMLOptions, IWebpackStats} from '../types';
import {log, logMemoryUse} from './log';
import {ssrCache} from './cache';

export function handleSSR(options: IHandleSSROptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template} = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;

        if (!isCsr) {
            const startTime = new Date().valueOf();
            try {
                log('info', `${req.path} 触发服务端渲染`);
                html = await renderHTML({req, ...options});
                logMemoryUse();
            } catch (error) {
                log('error', '服务端渲染失败\n', error);
            } finally {
                log('debug', `SSR 耗时 ${new Date().valueOf() - startTime}ms`);
            }
        } else {
            log('debug', `${req.path} 跳过服务端渲染`);
        }

        res.send(html);
        next();
    };
}

/** 创建服务端 Vue 实例，返回渲染好的渲染 HTML 内容 */
async function renderHTML(options: IRenderHTMLOptions) {
    const {template, req, createApp, clientWpStats} = options;

    const {app, pinia, router} = await createApp({
        req,
    });

    const currentRoute = (router as Router).currentRoute.value;
    // 获取 SSR 缓存
    const cacheInfo = currentRoute.meta.ssrCache as any;
    const enableCache = typeof cacheInfo?.enable === 'function' ? cacheInfo.enable(req) : !!cacheInfo?.enable;
    const cacheKey = typeof cacheInfo?.key === 'function' ? cacheInfo.key(req) : cacheInfo?.key ?? req.url;
    if (enableCache && ssrCache.has(cacheKey)) {
        log('debug', `使用缓存的 SSR 页面, lru key ${cacheKey}`);
        return ssrCache.get(cacheKey) as string;
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
        if (enableCache) {
            log('debug', `创建 SSR 缓存, lru key ${cacheKey}`);
            ssrCache.set(cacheKey, html, {
                ttl: cacheInfo.ttl,
            });
        }
        return html;
    } catch (error) {
        // @ts-ignore
        clearTimeout(timeout);
        throw error;
    }
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
        if (asset.endsWith('.js')) {
            preloadLinks.js += `<link rel="preload" as="script" href="${asset}">`;
        }
    });
    return preloadLinks;
}
