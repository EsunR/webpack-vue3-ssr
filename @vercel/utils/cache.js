"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssrCache = void 0;
const lru_cache_1 = require("lru-cache");
exports.ssrCache = new lru_cache_1.LRUCache({
    max: 100,
});
