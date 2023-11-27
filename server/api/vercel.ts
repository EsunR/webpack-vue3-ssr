import {Request, Response} from 'express';
import {app} from '../server';

export default (req: Request, res: Response) => {
    app(req, res);
};
