import {Request} from 'express';
import createServerAppInstance from '../src/entry/server';

export type CreateServerAppInstanceFunc = typeof createServerAppInstance;

export interface IHandleSSROptions {
    template: string;
    createApp: CreateServerAppInstanceFunc;
}

export interface IRenderHTMLOptions {
    template: string;
    req: Request;
    createApp: CreateServerAppInstanceFunc;
}
