import {Request} from 'express';
import createServerAppInstance from '../src/entry/server';

export type CreateAppFunc = typeof createServerAppInstance;

export interface IHandleSSROptions {
    template: string;
    createApp: CreateAppFunc;
}

export interface IRenderHTMLOptions {
    template: string;
    req: Request;
    createApp: CreateAppFunc;
}
