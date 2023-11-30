declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VERCEL?: 1;
            BACKEND_URL?: string;
            APP_ENV: 'dev' | 'preonline' | 'online';
        }
    }
}

export {};
