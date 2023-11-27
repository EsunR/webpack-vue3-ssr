import chalk from 'chalk';
import express from 'express';
import MFS from 'memory-fs';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {merge} from 'webpack-merge';
import clientConfig from '../webpack/app/webpack.client';
import serverConfig from '../webpack/app/webpack.server';
import {NO_MATCH_SSR_REG, SSR_SERVER_PORT, USE_MFS} from './config';
import commonMiddleware from './middleware/common';
import {CreateServerAppInstanceFunc, IWebpackStats} from './types';
import {createCJSModelInVm} from './utils';
import {log} from './utils/log';
import {WebpackBuildCbPlugin} from './utils/plugin';
import {handleSSR} from './utils/render';
import fs from 'fs';

const mfs = USE_MFS ? new MFS() : fs;

const clientOutputPath = clientConfig.output?.path as string;
const serverOutputPath = serverConfig.output?.path as string;

let serverManifest = {};
let clientWpStats: IWebpackStats = {
    publicPath: '',
    namedChunkGroups: {},
};
let clientTemplate = '';
let mainJsContent = '';
let createApp = {} as CreateServerAppInstanceFunc;

function onServerBuildSuccess() {
    log('success', '[Webpack] Server build success');
    log('success', `[Webpack] SSR service running on ${chalk.green.underline(`http://localhost:${SSR_SERVER_PORT}`)}`);
    serverManifest = JSON.parse(mfs.readFileSync(path.join(serverOutputPath, 'manifest.json'), 'utf-8'));
    mainJsContent = mfs.readFileSync(path.join(serverOutputPath, serverManifest['main.js']), 'utf-8');
    createApp = createCJSModelInVm(mainJsContent).default as any as CreateServerAppInstanceFunc;
}

function onClientBuildSuccess() {
    log('success', '[Webpack] Client build success');
    clientWpStats = JSON.parse(mfs.readFileSync(path.join(clientOutputPath, 'stats.json'), 'utf-8'));
    clientTemplate = mfs.readFileSync(path.join(clientOutputPath, 'index.html'), 'utf-8');
}

// 执行 webpack 构建
const clientCompiler = webpack(
    merge(clientConfig, {
        entry: [clientConfig.entry as string, 'webpack-hot-middleware/client'],
        watchOptions: {
            ignored: ['node_modules', 'server'],
        },
        plugins: [new webpack.HotModuleReplacementPlugin(), new WebpackBuildCbPlugin(onClientBuildSuccess)],
    })
);

const serverCompiler = webpack(
    merge(serverConfig, {
        plugins: [new WebpackBuildCbPlugin(onServerBuildSuccess)],
    })
);

const clientWpMiddleware = webpackDevMiddleware(clientCompiler, {
    outputFileSystem: USE_MFS ? (mfs as any) : undefined,
    writeToDisk: USE_MFS ? false : true,
    index: false,
});

const serverWpMiddleware = webpackDevMiddleware(serverCompiler, {
    outputFileSystem: USE_MFS ? (mfs as any) : undefined,
    writeToDisk: USE_MFS ? false : true,
    index: false,
});

const app = express();

// 处理 express 中间件
app.use(
    express.static(path.join(__dirname, '../public'), {
        index: false,
    })
);

app.use(clientWpMiddleware);

app.use(serverWpMiddleware);

app.use(webpackHotMiddleware(clientCompiler));

commonMiddleware(app);

app.get('*', async (req, res, next) => {
    if (NO_MATCH_SSR_REG.exec(req.url)) {
        next();
        return;
    }
    handleSSR({template: clientTemplate, createApp, clientWpStats})(req, res, next);
});

app.listen(SSR_SERVER_PORT);
