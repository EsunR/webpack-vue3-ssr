import {NodeVM} from 'vm2';

/**
 * 根据代码创建 CommonJS 模块
 */
export function createCJSModel(code: string) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const temp = {exports: {default: () => {}}};
    eval('(function (module) {' + code + '})(temp);');
    return temp.exports;
}

/**
 * 根据代码创建 CommonJS 模块（基于 VM）
 */
export function createCJSModelInVm(code: string) {
    const vm = new NodeVM({
        allowAsync: true,
        require: {
            external: true,
        },
        eval: true,
        wrapper: 'commonjs',
        sandbox: {},
    });
    const runResult = vm.run(code, 'vm2.js');
    return runResult;
}

export function wait(time: number) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
