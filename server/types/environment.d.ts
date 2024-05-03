declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            /** 是否是 Vercel 部署 */
            VERCEL?: 1;
            /** SSR 服务预取数据时调用的后端接口，默认为 http://localhost:SSR_SERVER_PORT */
            BACKEND_URL?: string;
            /** 当前 APP 的环境 */
            APP_ENV?: 'dev' | 'preonline' | 'online';
        }
    }
}

export {};
