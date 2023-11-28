"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("./main"));
/**
 * 为每个请求单独创建一个 app 实例
 */
async function createServerAppInstance(ctx) {
    const { app, router, pinia } = (0, main_1.default)();
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
exports.default = createServerAppInstance;
