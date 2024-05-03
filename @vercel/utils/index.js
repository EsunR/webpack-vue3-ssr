"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.createCJSModelInVm = exports.createCJSModel = void 0;
const vm2_1 = require("vm2");
/**
 * 根据代码创建 CommonJS 模块
 */
function createCJSModel(code) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const temp = { exports: { default: () => { } } };
    eval('(function (module) {' + code + '})(temp);');
    return temp.exports;
}
exports.createCJSModel = createCJSModel;
/**
 * 根据代码创建 CommonJS 模块（基于 VM）
 */
function createCJSModelInVm(code) {
    const vm = new vm2_1.NodeVM({
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
exports.createCJSModelInVm = createCJSModelInVm;
function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}
exports.wait = wait;
