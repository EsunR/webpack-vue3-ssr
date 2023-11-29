import express from 'express';
import fs from 'fs';
import path from 'path';
import {NO_MATCH_SSR_REG} from './config';
import commonMiddleware from './middleware/common';
import {CreateServerAppInstanceFunc} from './types';
import {handleSSR} from './utils/render';

const CLIENT_PATH = 'client';
const SERVER_PATH = 'server';

const app = express();

const serverManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, SERVER_PATH, 'manifest.json'), 'utf-8'));
const clientTemplate = fs.readFileSync(path.resolve(__dirname, CLIENT_PATH, 'index.html'), 'utf-8');
const clientWpStats = JSON.parse(fs.readFileSync(path.resolve(__dirname, CLIENT_PATH, 'stats.json'), 'utf-8'));
const mainJsPath = path.resolve(__dirname, SERVER_PATH, serverManifest['main.js']);
// @ts-ignore
const requireMethod = process.env.VERCEL ? require : __non_webpack_require__;
const createApp = requireMethod(mainJsPath).default as any as CreateServerAppInstanceFunc;

commonMiddleware(app);

app.get('*', async (req, res, next) => {
    if (NO_MATCH_SSR_REG.exec(req.url)) {
        next();
        return;
    }
    handleSSR({template: clientTemplate, createApp, clientWpStats})(req, res, next);
});

export default app;
