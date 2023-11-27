/**
 * CSR 和 SSR 共用的 Webpack 配置
 */
import path from 'path';
import {VueLoaderPlugin} from 'vue-loader';
import webpack from 'webpack';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
// @ts-ignore
import {StatsWriterPlugin} from 'webpack-stats-plugin';
import {ROOT_DIR} from '../config';

const config: webpack.Configuration = {
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@': path.resolve(ROOT_DIR, './app'),
            '@server': path.resolve(ROOT_DIR, './server'),
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
        new VueLoaderPlugin(),
        new WebpackManifestPlugin({fileName: 'manifest.json'}),
        new StatsWriterPlugin({
            filename: 'stats.json',
            fields: ['publicPath', 'namedChunkGroups'],
        }),
    ],
};

export default config;
