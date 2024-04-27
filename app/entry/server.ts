import type {Request} from 'express';
import createAppInstance from './main';

export interface Ctx {
    req: Request;
}

/**
 * 为每个请求单独创建一个 app 实例
 */
export default async function createServerAppInstance(ctx: Ctx) {
    const {app, router, pinia} = createAppInstance();

    /**
     * 服务端创建路由需要手动推入当前请求的 url
     * https://router.vuejs.org/zh/guide/migration/#%E6%96%B0%E7%9A%84-history-%E9%85%8D%E7%BD%AE%E5%8F%96%E4%BB%A3-mode
     */
    router.push(ctx.req.url);
    await router.isReady();

    return {
        app,
        router,
        pinia,
    };
}
