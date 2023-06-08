import path from 'path';
import {merge} from 'webpack-merge';
import {ENV_DEFINE, IS_DEV, ROOT_DIR} from './config';
import commonConfig from './webpack.common';
import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';
import webpack from 'webpack';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const devServer: DevServerConfiguration = {
    static: {
        directory: path.join(ROOT_DIR, './public'),
    },
    compress: true,
    port: 9000,
};

const config = merge(commonConfig, {
    target: 'web',
    mode: IS_DEV ? 'development' : 'production',
    devtool: IS_DEV ? 'source-map' : false,
    entry: path.resolve(ROOT_DIR, './src/entry/client.ts'),
    output: {
        path: path.resolve(ROOT_DIR, './dist/client'),
        clean: true,
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/[name].[contenthash:8].js',
    },
    devServer,
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    IS_DEV ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    IS_DEV ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].css',
        }),
        new webpack.DefinePlugin({
            ...ENV_DEFINE,
            'process.env.IS_NODE': false,
        }),
        new WebpackManifestPlugin({fileName: 'server-manifest.json'}),
    ],
});

export default config;
