import {Router} from 'express';
import {wait} from '../../utils';

const testRouter = Router();

testRouter.get('/test', async (req, res) => {
    await wait(2000);
    res.json({time: new Date()});
});

export default testRouter;
