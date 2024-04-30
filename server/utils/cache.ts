import {LRUCache} from 'lru-cache';

export const ssrCache = new LRUCache<string, string>({
    max: 100,
});
