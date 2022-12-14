import path from 'path';
import webpack from 'webpack';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
import {merge} from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import {ENV_DEFINE, ROOT_DIR} from './config';
import commonConfig from './webpack.common';

const config = merge(commonConfig, {
    target: 'node',
    entry: path.resolve(ROOT_DIR, './src/entry/server.ts'),
    output: {
        path: path.resolve(ROOT_DIR, './dist/server'),
        clean: true,
        filename: 'static/js/[name].[contenthash:8].js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'vue-style-loader',
                        options: {
                            esModule: false,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false,
                        },
                    },
                    'postcss-loader',
                ],
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
        new WebpackManifestPlugin({fileName: 'server-manifest.json'}),
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
