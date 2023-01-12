const ivm = require("isolated-vm");

async function runIsolate() {
  const isolate = new ivm.Isolate({
    memoryLimit: 128,
  });
  const context = await isolate.createContext();

  const result = context.evalClosureSync(
    `
    const foo = {a: 123};
    function handler() {
      return foo;
    }
    // 这里调用外部传进来的函数
    // 这里说明内部可以调用外部传进来的函数
    return $0.apply(undefined, [handler], { result: { copy: true }})
    `,
    [
      // 这里是传给 vm 的参数，在 vm 内通过 $0、$1 等访问
      (handler) => {
        // 这里的 handler 就是 vm 内部的 handler
        // 这里说明外部可以调用vm内部返回的函数
        return handler();
      },
    ],
    // 这里是传给 vm 参数以及vm执行后的返回值的选项
    { arguments: { reference: true }, result: { promise: true, copy: true } }
  );

  result.then((value) => {
    console.log("value", value);

    isolate.dispose();
  });
}

setInterval(() => {
  runIsolate();
}, 5000);
