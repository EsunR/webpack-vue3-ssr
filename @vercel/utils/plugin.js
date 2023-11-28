"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackBuildCbPlugin = void 0;
class WebpackBuildCbPlugin {
    callback;
    constructor(callback) {
        this.callback = callback;
    }
    apply(compiler) {
        compiler.hooks.done.tap('WebpackBuildCbPlugin', stats => {
            console.log("\n==============================");
            this.callback?.(stats);
            console.log("==============================");
        });
    }
}
exports.WebpackBuildCbPlugin = WebpackBuildCbPlugin;
