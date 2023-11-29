"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const log_1 = require("./utils/log");
app_1.default.listen(config_1.SSR_SERVER_PORT, () => {
    (0, log_1.log)('success', `Server is listening on port ${config_1.SSR_SERVER_PORT}`);
});
