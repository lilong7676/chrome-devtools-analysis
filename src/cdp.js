const CDP = require("chrome-remote-interface");

// 通过默认的连接配置，连接到对应的 调试实例（inspector agent）
CDP(async (client) => {
  // 连接成功，通过 CDP client 即可操作调试实例
  const { Debugger, Runtime, Network } = client;
  try {
    // 监听 scriptParsed 事件，拿到 script source code
    Debugger.on("scriptParsed", async (params) => {
      const { scriptId, url } = params;
      // console.log(`scriptId: ${scriptId}, url: ${url}`);
      if (url.startsWith("file://")) {
        const source = await client.Debugger.getScriptSource({ scriptId });
        // 打印获取到的 script 源码
        console.log("script source", source);
      }
    });

    // 监听进入到断点事件
    Debugger.on("paused", (pausedEvent) => {
      // pausedEvent 里面包含当前断点的位置以及 callFrames 信息等
      // console.log('pausedEvent ', pausedEvent);
    });

    // 调试实例如果在等待附加调试器，则先继续运行调试实例
    await Runtime.runIfWaitingForDebugger();

    // 请求允许使用 agent 的 Debugger 功能
    await Debugger.enable();
    // 请求允许使用 agent 的 Runtime 功能
    await Runtime.enable();

    // try {
    //   // 网络请求域
    //   await Network.enable({ maxPostDataSize: 65536 });
    //   Network.requestWillBeSent((event) => {
    //     console.log("requestWillBeSent event", event);
    //   });
    //   Network.responseReceived((event) => {
    //     console.log("responseReceived event", event);
    //   });
    //   Network.loadingFinished((event) => {
    //     console.log("loadingFinished event", event);
    //   });
    // } catch (error) {
    //   console.error('Network attach failed', error);
    // }

    // 远程执行代码
    const testValue = await Runtime.evaluate({
      expression: "eval(1 + 1)",
    });
    console.log("evaluate result", testValue);
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}).on("error", (err) => {
  console.error(err);
});
