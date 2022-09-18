import createAppInstance from '@/entry/main';
import {Request, Response} from 'express';

export interface Ctx {
    req: Request;
    res: Response;
}

/**
 * 为每个请求单独创建一个 app 实例
 */
export default function createServerAppInstance() {
    return createAppInstance();
}
