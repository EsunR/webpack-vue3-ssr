import devalue from '@nuxt/devalue';
import {NextFunction, Request, Response} from 'express';
import {renderToString} from 'vue/server-renderer';
import {CreateServerAppInstanceFunc, IHandleSSROptions, IRenderHTMLOptions} from '../types';
import {log, logMemoryUse} from './log';

export function handleSSR(options: IHandleSSROptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template, createApp} = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;

        if (!isCsr && createApp) {
            try {
                const startTime = new Date().valueOf();
                log('debug', '服务端渲染中...');
                html = await renderHTML({template, req, createApp: createApp as CreateServerAppInstanceFunc});
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
    const {template, req, createApp} = options;
    const result = await createApp({
        req,
    });
    const {app, pinia} = result;
    const ssrContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };
    const appContent = await renderToString(app, ssrContext);
    const html = template
        .replace('<!-- app-html -->', `${appContent}`)
        .replace('<!-- app-state -->', `<script>window.__PINIA_STATE__ = ${devalue(pinia.state.value)}</script>`);
    return html;
}
