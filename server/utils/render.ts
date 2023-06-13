import devalue from '@nuxt/devalue';
import {NextFunction, Request, Response} from 'express';
import {Router} from 'vue-router';
import {renderToString} from 'vue/server-renderer';
import {IHandleSSROptions, IPreloadLinks, IRenderHTMLOptions, IWebpackStats} from '../types';
import {log, logMemoryUse} from './log';

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

export function handleSSR(options: IHandleSSROptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template} = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;

        if (!isCsr) {
            try {
                const startTime = new Date().valueOf();
                log('debug', '服务端渲染中...');
                html = await renderHTML({req, ...options});
                const endTime = new Date().valueOf();
                log('debug', `服务端渲染成功，耗时 ${endTime - startTime}ms`);
                logMemoryUse();
            } catch (error) {
                log('error', '服务端渲染失败\n', error);
            }
        }

        res.send(html);
        next();
    };
}

async function renderHTML(options: IRenderHTMLOptions) {
    const {template, req, createApp, clientWpStats} = options;
    const {app, pinia, router} = await createApp({
        req,
    });
    const currentPageChunkNames = (router as Router).currentRoute.value.matched
        .map(item => item.meta?.chunkNames as string[])
        .filter(item => !!item)
        .flat();
    const preloadLinks = getPreloadLinkByChunkNames(currentPageChunkNames, clientWpStats);
    const ssrContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };
    const appContent = await renderToString(app, ssrContext);
    const html = template
        .replace('<!-- css-preload-links -->', `${preloadLinks.css}`)
        .replace('<!-- js-preload-links -->', `${preloadLinks.js}`)
        .replace('<!-- app-html -->', `${appContent}`)
        .replace('<!-- app-state -->', `<script>window.__PINIA_STATE__ = ${devalue(pinia.state.value)}</script>`);
    return html;
}
