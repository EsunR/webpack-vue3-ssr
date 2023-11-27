import fs from 'fs';
import path from 'path';
import {CreateServerAppInstanceFunc} from './types';
import express from 'express';
import commonMiddleware from './middleware/common';
import {handleSSR} from './utils/render';
import {NO_MATCH_SSR_REG, SSR_SERVER_PORT} from './config';
import {log} from './utils/log';

const CLIENT_PATH = 'client';
const SERVER_PATH = 'server';

export const app = express();

const serverManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, SERVER_PATH, 'manifest.json'), 'utf-8'));
const clientTemplate = fs.readFileSync(path.resolve(__dirname, CLIENT_PATH, 'index.html'), 'utf-8');
const clientWpStats = JSON.parse(fs.readFileSync(path.resolve(__dirname, CLIENT_PATH, 'stats.json'), 'utf-8'));
const mainJsPath = path.resolve(__dirname, SERVER_PATH, serverManifest['main.js']);
// @ts-ignore
const createApp = require(mainJsPath).default as any as CreateServerAppInstanceFunc;

commonMiddleware(app);

app.get('*', async (req, res, next) => {
    if (NO_MATCH_SSR_REG.exec(req.url)) {
        next();
        return;
    }
    handleSSR({template: clientTemplate, createApp, clientWpStats})(req, res, next);
});

app.listen(SSR_SERVER_PORT, () => {
    log('success', `Server is listening on port ${SSR_SERVER_PORT}`);
});
