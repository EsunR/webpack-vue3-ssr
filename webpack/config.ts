import path from 'path';

export const IS_DEV = process.env.NODE_ENV === 'development';
export const ROOT_DIR = path.join(__dirname, '../');
export const ENV_DEFINE = {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    'process.env.IS_NODE': false,
    'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
};