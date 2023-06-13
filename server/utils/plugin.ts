import {Compiler, Stats} from 'webpack';

export class WebpackBuildCbPlugin {
    constructor(private readonly callback?: (stats: Stats) => void) {}
    apply(compiler: Compiler) {
        compiler.hooks.done.tap('WebpackBuildCbPlugin', stats => {
            console.log("\n==============================");
            this.callback?.(stats);
            console.log("==============================");
        });
    }
}
