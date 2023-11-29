import chalk from 'chalk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

type LogType = 'warn' | 'error' | 'success' | 'info' | 'debug';
dayjs.extend(utc);

export function log(logType: LogType, message?: any, ...rest: any[]) {
    let prefix = '';
    switch (logType) {
        case 'warn':
            prefix = chalk.black.bgYellow('WARN');
            break;
        case 'error':
            prefix = chalk.white.bgRed('ERROR');
            break;
        case 'success':
            prefix = chalk.black.bgGreen('SUCCESS');
            break;
        case 'info':
            prefix = chalk.black.bgBlue('INFO');
            break;
        case 'debug':
        default:
            prefix = chalk.black.bgWhite('DEBUG');
            break;
    }
    console.log(`[${dayjs().utcOffset(8).format('YYYY-MM-DD HH:mm:ss')}]`, prefix, message, ...rest);
}

let FIRST_LOG_RSS_MEMORY_VALUE = 0;
export function logMemoryUse() {
    const used = process.memoryUsage();
    const messages: string[] = [];
    let currentRSSMemoryValue = 0;
    for (const key in used) {
        const memoryValue = Math.round(((used as any)[key] / 1024 / 1024) * 100) / 100;
        messages.push(`${key}: ${memoryValue} MB`);
        if (key === 'rss') {
            currentRSSMemoryValue = memoryValue;
            if (FIRST_LOG_RSS_MEMORY_VALUE === 0) {
                FIRST_LOG_RSS_MEMORY_VALUE = currentRSSMemoryValue;
            }
        }
    }
    log('debug', '[MemoryLog] 内存占用情况：', messages.join(', '));
    log(
        'debug',
        '[MemoryLog] RSS 内存浮动' + Number.parseFloat((currentRSSMemoryValue - FIRST_LOG_RSS_MEMORY_VALUE).toFixed(2)) + ' MB'
    );
}
