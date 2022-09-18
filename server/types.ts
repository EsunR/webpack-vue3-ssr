import createServerAppInstance from '../src/entry/server';

export interface IRenderHTMLOptions {
    template: string;
    createApp: CreateAppFunc;
}

export type CreateAppFunc = typeof createServerAppInstance;
