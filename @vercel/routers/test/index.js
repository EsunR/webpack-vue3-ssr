"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../../utils");
const testRouter = (0, express_1.Router)();
testRouter.get('/test', async (req, res) => {
    await (0, utils_1.wait)(2000);
    res.json({ time: new Date() });
});
exports.default = testRouter;
