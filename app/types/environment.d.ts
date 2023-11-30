declare global {
    namespace NodeJS {
        interface ProcessEnv {
            IS_NODE: boolean;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export {};
