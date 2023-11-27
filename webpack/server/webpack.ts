/**
 * 构建服务端代码的配置
 */
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import CopyPlugin from 'copy-webpack-plugin';
import {ROOT_DIR} from '../config';

const config: webpack.Configuration = {
    mode: 'none',
    target: 'node',
    entry: {
        server: path.join(ROOT_DIR, 'server/server.ts'),
        'api/vercel': path.join(ROOT_DIR, 'server/api/vercel.ts'),
    },
    output: {
        path: path.resolve(ROOT_DIR, 'dist'),
        clean: true,
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {transpileOnly: true},
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(ROOT_DIR, 'package.json'),
                    to: path.resolve(ROOT_DIR, 'dist'),
                    transform: content => {
                        // 修改 package.json 内容
                        const data = JSON.parse(content.toString());
                        data.main = 'server.js';
                        data.scripts = data.prodScripts;
                        delete data.prodScripts;
                        delete data.devDependencies;
                        return JSON.stringify(data, null, 2);
                    },
                },
                {
                    from: path.resolve(ROOT_DIR, 'package-lock.json'),
                    to: path.resolve(ROOT_DIR, 'dist'),
                },
                {
                    from: path.resolve(ROOT_DIR, 'vercel.json'),
                    to: path.resolve(ROOT_DIR, 'dist'),
                },
            ],
        }),
    ],
    externalsPresets: {node: true},
    externals: [nodeExternals()],
};

export default config;
