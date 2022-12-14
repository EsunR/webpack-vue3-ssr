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
import {renderHtml} from './utils/render';
import {CreateAppFunc} from './types';

const mfs = new MFS();

const clientOutputPath = clientConfig.output?.path as string;
const serverOutputPath = serverConfig.output?.path as string;

const clientCompiler = webpack({
    ...clientConfig,
    mode: 'development',
    devtool: 'source-map',
    entry: [clientConfig.entry as string, 'webpack-hot-middleware/client'],
    module: {
        ...clientConfig.module,
        parser: {
            javascript: {
                commonjs: true,
                commonjsMagicComments: true,
            },
        },
    },
    watchOptions: {
        ignored: ['node_modules', 'server'],
    },
    plugins: [...(clientConfig.plugins as any), new webpack.HotModuleReplacementPlugin()],
});

const serverCompiler = webpack({
    ...serverConfig,
    mode: 'development',
});

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

    renderHtml({template: clientTemplate, createApp})(req, res, next);
});

app.listen(SSR_SERVER_PORT, () => {
    console.log(`SSR server running on http://localhost:${SSR_SERVER_PORT}`);
});
