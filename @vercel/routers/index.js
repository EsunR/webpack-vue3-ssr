"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountRoutes = void 0;
const test_1 = __importDefault(require("./test"));
function mountRoutes(app) {
    app.use('/api', test_1.default);
}
exports.mountRoutes = mountRoutes;
