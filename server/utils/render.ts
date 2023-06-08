import devalue from '@nuxt/devalue';
import {NextFunction, Request, Response} from 'express';
import {renderToString} from 'vue/server-renderer';
import {CreateServerAppInstanceFunc, IHandleSSROptions, IRenderHTMLOptions} from '../types';

export function handleSSR(options: IHandleSSROptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template, createApp} = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;

        if (!isCsr && createApp) {
            try {
                html = await renderHTML({template, req, createApp: createApp as CreateServerAppInstanceFunc});
            } catch (error) {
                console.log('error: ', error);
                console.log('服务端渲染失败');
            }
        }

        res.send(html);
        next();
    };
}

async function renderHTML(options: IRenderHTMLOptions) {
    const {template, req, createApp} = options;
    const {app, pinia} = await createApp({
        req,
    });
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
