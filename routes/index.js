const Router = require("@koa/router");

// const cluster = require("cluster");
// const { workerEmitter, masterEmitter } = require("../workerEmitter");


const indexRouter = new Router();

indexRouter.get("/", (ctx) => {
  ctx.body = `${process.pid} Hello Koa......\n`;
});

indexRouter.get("/kill", (ctx) => {
  const { killPid } = ctx.query;
  // console.log({ killPid });

  // setTimeout(() => {
  //   process.exit(1);
  // }, 30000);

  // process.send("kill", { pid: killPid });
  process.send({ cmd: 'kill', pid: killPid });
  // cluster.worker.disconnect();
  ctx.body = `${process.pid} will be kill ${killPid}`;
});

exports.indexRouter = indexRouter;
// exports.workerEmitter = workerEmitter;
