// 定义 process.env
declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production';
        readonly PLATFORM: 'vercel' | 'default';
    }
}
