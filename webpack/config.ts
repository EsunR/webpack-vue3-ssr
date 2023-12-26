import path from 'path';

export const IS_VERCEL = process.env.PLATFORM === 'vercel';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const ROOT_DIR = path.join(__dirname, '../');
export const DIST_DIR = path.resolve(ROOT_DIR, IS_VERCEL ? '@vercel' : 'dist')
export const ENV_DEFINE = {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    'process.env.IS_NODE': false,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
};
