import {NextFunction, Request, Response} from 'express';
import {renderToString} from 'vue/server-renderer';
import {CreateAppFunc, IHandleSSROptions, IRenderHTMLOptions} from '../types';

export function handleSSR(options: IHandleSSROptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template, createApp} = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;

        if (!isCsr && createApp) {
            try {
                html = await renderHTML({template, req, createApp: createApp as CreateAppFunc});
            } catch (error) {
                console.log('服务端渲染失败');
            }
        }

        res.send(html);
        next();
    };
}

async function renderHTML(options: IRenderHTMLOptions) {
    const {template, req, createApp} = options;
    const {app} = createApp();
    const ssrContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };
    const appContent = await renderToString(app, ssrContext);
    const html = template.replace('<!-- app-html -->', `${appContent}`);
    return html;
}