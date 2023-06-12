import fs from 'fs';
import path from 'path';
import {CreateServerAppInstanceFunc} from './types';
import express from 'express';
import commonMiddleware from './middleware/common';
import {handleSSR} from './utils/render';
import {SSR_SERVER_PORT} from './config';
import {log} from './utils/log';

const CLIENT_PATH = 'client';
const SERVER_PATH = 'server';

const app = express();

const serverManifest = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, SERVER_PATH, 'server-manifest.json'), 'utf-8')
);
const clientTemplate = fs.readFileSync(path.resolve(__dirname, CLIENT_PATH, 'index.html'), 'utf-8');
const mainJsPath = path.resolve(__dirname, SERVER_PATH, serverManifest['main.js']);
console.log('mainJsPath: ', mainJsPath);
// @ts-ignore
const createApp = __non_webpack_require__(mainJsPath).default as any as CreateServerAppInstanceFunc;
console.log('createApp: ', createApp);

commonMiddleware(app);

app.get('*', async (req, res, next) => {
    handleSSR({template: clientTemplate, createApp})(req, res, next);
});

app.listen(SSR_SERVER_PORT, () => {
    log('success', `Server is listening on port ${SSR_SERVER_PORT}`);
});
