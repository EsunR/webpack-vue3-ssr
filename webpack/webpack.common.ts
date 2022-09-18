import path from 'path';
import webpack from 'webpack';
import {VueLoaderPlugin} from 'vue-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {ENV_DEFINE, ROOT_DIR} from './config';

const config: webpack.Configuration = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@': path.resolve(ROOT_DIR, './src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                use: ['vue-loader'],
            },
            {
                test: /\.m?js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    process.env.NODE_ENV === 'development' ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    appendTsSuffixTo: ['\\.vue$'],
                    happyPackMode: true,
                },
            },
        ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            ...ENV_DEFINE,
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(ROOT_DIR, 'public', './index.html'),
            minify: {
                // 不删除 html 里的注释, 因为在 SSR 侧使用的是注释来匹配内容要插入的位置
                removeComments: false,
            },
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].css',
        }),
    ],
};

export default config;
