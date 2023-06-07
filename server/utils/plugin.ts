import {Compiler, Stats} from 'webpack';

export class WebpackBuildSuccessLogPlugin {
    constructor(private readonly logHook?: (stats: Stats) => void) {}
    apply(compiler: Compiler) {
        compiler.hooks.done.tap('WebpackBuildSuccessLogPlugin', stats => {
            console.log("\n==============================");
            this.logHook?.(stats);
            console.log("==============================");
        });
    }
}
