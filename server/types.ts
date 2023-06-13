import {Request} from 'express';
import createServerAppInstance from '../src/entry/server';

export type CreateServerAppInstanceFunc = typeof createServerAppInstance;

export interface IHandleSSROptions {
    template: string;
    createApp: CreateServerAppInstanceFunc;
    clientWpStats: IWebpackStats;
}

export interface IRenderHTMLOptions extends IHandleSSROptions {
    req: Request;
}

export interface IWebpackStats {
    publicPath: string;
    namedChunkGroups: Record<
        string,
        {
            name: string;
            assets: Array<{name: string}>;
            auxiliaryAssets: Array<{name: string}>;
        }
    >;
}

export interface IPreloadLinks {
    css: string;
    js: string;
}
