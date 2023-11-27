/**
 * 构建服务端渲染 App 的配置
 */
import path from 'path';
import webpack from 'webpack';
import {merge} from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import {ENV_DEFINE, IS_DEV, ROOT_DIR} from '../config';
import commonConfig from './webpack.common';

const config = merge(commonConfig, {
    target: 'node',
    mode: IS_DEV ? 'development' : 'production',
    devtool: false,
    entry: path.resolve(ROOT_DIR, './app/entry/server.ts'),
    output: {
        path: path.resolve(ROOT_DIR, './dist/server'),
        clean: true,
        filename: 'static/js/[name].[contenthash:8].js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            // 服务端渲染不处理样式
            {
                test: /\.css$/,
                use: 'null-loader',
            },
            {
                test: /\.scss$/,
                use: 'null-loader',
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            ...ENV_DEFINE,
            'process.env.IS_NODE': true,
        }),
        // 服务端禁用分包, 否则会造成开发模式下 mfs 无法进行 module resolve
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    ],
    // 服务端关闭代码压缩和分包
    optimization: {
        minimize: false,
        splitChunks: false,
    },
    externalsPresets: {node: true},
    externals: [nodeExternals()],
});

export default config;
