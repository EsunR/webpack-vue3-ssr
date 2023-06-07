import clientConfig from '../webpack/webpack.client';
import serverConfig from '../webpack/webpack.server';
import MFS from 'memory-fs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import express from 'express';
import {SSR_SERVER_PORT} from './config';
import path from 'path';
import {createCJSModel} from './utils';
import {handleSSR} from './utils/render';
import {CreateAppFunc} from './types';
import {merge} from 'webpack-merge';
import {WebpackBuildSuccessLogPlugin} from './utils/plugin';

const mfs = new MFS();

const clientOutputPath = clientConfig.output?.path as string;
const serverOutputPath = serverConfig.output?.path as string;

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
                console.log('Client build success');
            }),
        ],
    })
);

const serverCompiler = webpack(
    merge(serverConfig, {
        plugins: [
            new WebpackBuildSuccessLogPlugin(() => {
                console.log('Server build success\n' + `Running on http://localhost:${SSR_SERVER_PORT}`);
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

app.use(
    express.static(path.join(__dirname, '../public'), {
        index: false,
    })
);

app.use(clientWbpMiddleware);

app.use(serverWbpMiddleware);

app.use(webpackHotMiddleware(clientCompiler));

app.get('*', async (req, res, next) => {
    const serverManifest = JSON.parse(mfs.readFileSync(path.join(serverOutputPath, 'server-manifest.json'), 'utf-8'));

    const clientTemplate = mfs.readFileSync(path.join(clientOutputPath, 'index.html'), 'utf-8');
    const mainJsContent = mfs.readFileSync(path.join(serverOutputPath, serverManifest['main.js']));

    const createApp = createCJSModel(mainJsContent).default as CreateAppFunc;

    handleSSR({template: clientTemplate, createApp})(req, res, next);
});

app.listen(SSR_SERVER_PORT);
