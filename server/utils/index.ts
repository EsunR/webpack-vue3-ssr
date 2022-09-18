/**
 * 根据代码创建 CommonJS 模块
 */
export function createCJSModel(code: string) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const temp = {exports: {default: () => {}}};
    eval('(function (module) {' + code + '})(temp);');
    return temp.exports;
}
