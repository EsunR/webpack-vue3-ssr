"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testRouter = (0, express_1.Router)();
testRouter.get('/test', (req, res) => {
    res.json({ time: new Date() });
});
exports.default = testRouter;
