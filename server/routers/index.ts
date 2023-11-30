import {Express} from 'express';
import testRouter from './test';

export function mountRoutes(app: Express) {
    app.use('/api', testRouter);
}
