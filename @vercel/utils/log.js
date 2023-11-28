"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMemoryUse = exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
function log(logType, message, ...rest) {
    let prefix = '';
    switch (logType) {
        case 'warn':
            prefix = chalk_1.default.black.bgYellow('WARN');
            break;
        case 'error':
            prefix = chalk_1.default.white.bgRed('ERROR');
            break;
        case 'success':
            prefix = chalk_1.default.black.bgGreen('SUCCESS');
            break;
        case 'info':
            prefix = chalk_1.default.black.bgBlue('INFO');
            break;
        case 'debug':
        default:
            prefix = chalk_1.default.black.bgWhite('DEBUG');
            break;
    }
    console.log(`[${(0, dayjs_1.default)().utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}]`, prefix, message, ...rest);
}
exports.log = log;
let FIRST_LOG_RSS_MEMORY_VALUE = 0;
function logMemoryUse() {
    const used = process.memoryUsage();
    const messages = [];
    let currentRSSMemoryValue = 0;
    for (const key in used) {
        const memoryValue = Math.round((used[key] / 1024 / 1024) * 100) / 100;
        messages.push(`${key}: ${memoryValue} MB`);
        if (key === 'rss') {
            currentRSSMemoryValue = memoryValue;
            if (FIRST_LOG_RSS_MEMORY_VALUE === 0) {
                FIRST_LOG_RSS_MEMORY_VALUE = currentRSSMemoryValue;
            }
        }
    }
    log('debug', '[MemoryLog] 内存占用情况：', messages.join(', '));
    log('debug', '[MemoryLog] RSS 内存浮动' + Number.parseFloat((currentRSSMemoryValue - FIRST_LOG_RSS_MEMORY_VALUE).toFixed(2)) + ' MB');
}
exports.logMemoryUse = logMemoryUse;
