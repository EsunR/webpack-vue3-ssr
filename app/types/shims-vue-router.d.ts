// typings.d.ts or router.ts
import 'vue-router';
import type {Request} from 'express';

declare module 'vue-router' {
    interface RouteMeta {
        /**
         * 手动指定 webpack 打包后的 chunk 名称，用于优化预载资源：
         * 比如在 A 页面中使用异步引入了 B 模块（比如异步路由、异步组件），B 模块打包后的 chunk 名称为 `b-chunk`，
         * 那么就可以在 A 页面的 meta 为 `{chunkNames: ['b-chunk']}`，从而在页面加载时对 b-chunk 进行预载。
         *
         * 如果你的页面在生产环境下出现样式闪烁的问题，可以尝试手动指定 chunk 名称来预载页面的 CSS，该配置在开发模式下不会预载 CSS 资源
         * PS：开发模式下的样式闪烁是正常的，因为开发环境下 CSS 是等 JS 加载完成之后动态插入的
         * @doc https://blog.esunr.site/2023/06/237cbfa282cc.html
         */
        chunkNames: string[];
        ssr?: {
            /** 是否对该页面禁用 SSR */
            disable?: boolean;
            /** SSR 缓存相关配置，如果没有该字段则不开启 SSR 侧缓存 */
            cache?: {
                /** 是否开启缓存 */
                enable: boolean | ((req: Request) => boolean);
                /** 缓存的 key，默认为 req.url */
                key?: string | ((req: Request) => string);
                /** 设定缓存时长，默认无时长，单位秒 */
                ttl?: number;
            };
            /** 当前页面是否开启 SSR 的流式渲染（如果开启了 SSR Cache 的话，不支持使用流式渲染）*/
            stream?: boolean;
        };
    }
}
