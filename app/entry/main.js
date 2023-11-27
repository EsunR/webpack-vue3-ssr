"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_vue_1 = __importDefault(require("@/App.vue"));
const router_1 = require("@/router");
require("@/styles/global.css");
const vue_1 = require("vue");
const pinia_1 = require("pinia");
const ssr_1 = require("@/utils/ssr");
function createAppInstance() {
    const needHydration = !ssr_1.IS_NODE && !!window.__INIT_STATE__;
    // 如果服务端渲染失败或者跳过渲染，就使用 createApp 创建客户端实例
    const app = needHydration ? (0, vue_1.createSSRApp)(App_vue_1.default) : (0, vue_1.createApp)(App_vue_1.default);
    const pinia = (0, pinia_1.createPinia)();
    app.use(pinia);
    const router = (0, router_1.createRouterInstance)();
    app.use(router);
    return {
        app,
        router,
        pinia,
    };
}
exports.default = createAppInstance;
