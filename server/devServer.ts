import chalk from 'chalk';
import express from 'express';
import MFS from 'memory-fs';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {merge} from 'webpack-merge';
import clientConfig from '../webpack/webpack.client';
import serverConfig from '../webpack/webpack.server';
import {SSR_SERVER_PORT} from './config';
import commonMiddleware from './middleware/common';
import {CreateServerAppInstanceFunc} from './types';
import {createCJSModelInVm} from './utils';
import {log} from './utils/log';
import {WebpackBuildSuccessLogPlugin} from './utils/plugin';
import {handleSSR} from './utils/render';

const mfs = new MFS();

const clientOutputPath = clientConfig.output?.path as string;
const serverOutputPath = serverConfig.output?.path as string;

let serverManifest = {};
let clientTemplate = '';
let mainJsContent = '';
let createApp = {} as CreateServerAppInstanceFunc;

function onServerBuildSuccess() {
    serverManifest = JSON.parse(mfs.readFileSync(path.join(serverOutputPath, 'server-manifest.json'), 'utf-8'));
    mainJsContent = mfs.readFileSync(path.join(serverOutputPath, serverManifest['main.js']), 'utf-8');
    createApp = createCJSModelInVm(mainJsContent).default as any as CreateServerAppInstanceFunc;
}

function onClientBuildSuccess() {
    clientTemplate = mfs.readFileSync(path.join(clientOutputPath, 'index.html'), 'utf-8');
}

// 执行 webpack 构建
const clientCompiler = webpack(
    merge(clientConfig, {
        devServer: undefined,
        entry: [clientConfig.entry as string, 'webpack-hot-middleware/client'],
        watchOptions: {
            ignored: ['node_modules', 'server'],
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new WebpackBuildSuccessLogPlugin(() => {
                log('success', '[Webpack] Client build success');
                onClientBuildSuccess();
            }),
        ],
    })
);

const serverCompiler = webpack(
    merge(serverConfig, {
        plugins: [
            new WebpackBuildSuccessLogPlugin(() => {
                log('success', '[Webpack] Server build success');
                log(
                    'success',
                    `[Webpack] SSR service running on ${chalk.green.underline(`http://localhost:${SSR_SERVER_PORT}`)}`
                );
                onServerBuildSuccess();
            }),
        ],
    })
);

const clientWbpMiddleware = webpackDevMiddleware(clientCompiler, {
    outputFileSystem: mfs as any,
    index: false,
});

const serverWbpMiddleware = webpackDevMiddleware(serverCompiler, {
    outputFileSystem: mfs as any,
    index: false,
});

const app = express();

// 处理 express 中间件
app.use(
    express.static(path.join(__dirname, '../public'), {
        index: false,
    })
);

app.use(clientWbpMiddleware);

app.use(serverWbpMiddleware);

app.use(webpackHotMiddleware(clientCompiler));

commonMiddleware(app);

app.get('*', async (req, res, next) => {
    handleSSR({template: clientTemplate, createApp})(req, res, next);
});

app.listen(SSR_SERVER_PORT);
