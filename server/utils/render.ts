import {NextFunction, Request, Response} from 'express';
import {renderToString} from 'vue/server-renderer';
import {CreateAppFunc, IRenderHTMLOptions} from '../types';

async function handleSSRRender(options: {template: string; req: Request; createApp: CreateAppFunc}) {
    const {template, req, createApp} = options;
    const {app} = createApp();
    const SSRContext = {
        path: req.url,
        ua: req.get('User-Agent'),
    };
    const appContent = await renderToString(app, SSRContext);
    const html = template.replace('<!--app-html-->', `${appContent}`);
    return html;
}

export function renderHtml(options: IRenderHTMLOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {template, createApp} = options;
        const isCsr = /(is)?_?csr/.test(req.url);
        let html = template;

        if (!isCsr && createApp) {
            try {
                html = await handleSSRRender({template, req, createApp: createApp as CreateAppFunc});
            } catch (error) {
                console.log('服务端渲染失败');
            }
        }

        res.send(html);
        next();
    };
}
