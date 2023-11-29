import {onServerPrefetch} from 'vue';

async function loadLogUtil() {
    return await import('../../server/utils/log');
}

export function safeOnServerPrefetch(fn: () => any) {
    onServerPrefetch(async () => {
        try {
            await fn();
        } catch (e) {
            const logUtil = await loadLogUtil();
            logUtil.log('error', 'Running onServerPrefetch error:', e);
        }
    });
}

export default safeOnServerPrefetch;
