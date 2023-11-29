"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const common_1 = __importDefault(require("./middleware/common"));
const render_1 = require("./utils/render");
const CLIENT_PATH = 'client';
const SERVER_PATH = 'server';
const app = (0, express_1.default)();
const serverManifest = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, SERVER_PATH, 'manifest.json'), 'utf-8'));
const clientTemplate = fs_1.default.readFileSync(path_1.default.resolve(__dirname, CLIENT_PATH, 'index.html'), 'utf-8');
const clientWpStats = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, CLIENT_PATH, 'stats.json'), 'utf-8'));
const mainJsPath = path_1.default.resolve(__dirname, SERVER_PATH, serverManifest['main.js']);
// @ts-ignore
const requireMethod = __non_webpack_require__ || require;
const createApp = requireMethod(mainJsPath).default;
(0, common_1.default)(app);
app.get('*', async (req, res, next) => {
    if (config_1.NO_MATCH_SSR_REG.exec(req.url)) {
        next();
        return;
    }
    (0, render_1.handleSSR)({ template: clientTemplate, createApp, clientWpStats })(req, res, next);
});
exports.default = app;
