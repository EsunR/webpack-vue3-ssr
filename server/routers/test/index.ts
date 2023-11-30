import {Router} from 'express';

const testRouter = Router();

testRouter.get('/test', (req, res) => {
    res.json({time: new Date()});
});

export default testRouter;
