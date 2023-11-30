import {Request} from 'express';
import {Pinia} from 'pinia';
import {App} from 'vue';
import {Router} from 'vue-router';

export type CreateServerAppInstanceFunc = (ctx: {req: Request}) => {app: App<Element>; router: Router; pinia: Pinia};

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
