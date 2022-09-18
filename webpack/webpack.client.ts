import path from 'path';
import {merge} from 'webpack-merge';
import {ENV_DEFINE, ROOT_DIR} from './config';
import commonConfig from './webpack.common';
import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';
import webpack from 'webpack';

const devServer: DevServerConfiguration = {
    static: {
        directory: path.join(ROOT_DIR, './public'),
    },
    compress: true,
    port: 9000,
};

const config = merge(commonConfig, {
    target: 'web',
    entry: path.resolve(ROOT_DIR, './src/entry/client.ts'),
    output: {
        path: path.resolve(ROOT_DIR, './dist/client'),
        clean: true,
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/[name].[contenthash:8].js',
    },
    devServer,
    plugins: [
        new webpack.DefinePlugin({
            ...ENV_DEFINE,
            'process.env.IS_NODE': false,
        }),
    ],
});

export default config;
