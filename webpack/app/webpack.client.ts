/**
 * 构建客户端渲染 App 的配置
 */
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import {ENV_DEFINE, IS_DEV, ROOT_DIR} from '../config';
import commonConfig from './webpack.common';

const config = merge(commonConfig, {
    target: 'web',
    mode: IS_DEV ? 'development' : 'production',
    devtool: IS_DEV ? 'source-map' : false,
    entry: path.resolve(ROOT_DIR, './app/entry/client.ts'),
    output: {
        path: path.resolve(ROOT_DIR, './dist/client'),
        clean: true,
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/[name].[contenthash:8].js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [IS_DEV ? 'vue-style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.scss$/,
                use: [
                    IS_DEV ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(ROOT_DIR, 'public', './index.html'),
            minify: {
                // 不删除 html 里的注释, 因为在 SSR 侧使用的是注释来匹配内容要插入的位置
                removeComments: false,
            },
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].css',
        }),
        new webpack.DefinePlugin({
            ...ENV_DEFINE,
            'process.env.IS_NODE': false,
        }),
    ],
});

export default config;
