const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;
const Koa = require("koa");

// const { workerEmitter, masterEmitter } = require("./workerEmitter");

const app = new Koa();
const workerMap = new Map();

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < 2; i++) {
    forkWorker();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    
  });

  function forkWorker() {
    const worker = cluster.fork();
    const workerPid = worker.process.pid;
    workerMap.set(workerPid, worker);

    worker.on("listening", (address) => {
      // console.log("worker listening", address);
    });

    worker.on("disconnect", (msg) => {
      // clearTimeout(timeout);
      console.log("disconnect");
      forkWorker();
    });

    worker.on("message", (msg) => {
      // console.log({ msg });
      let willBeKilledWoker = '';
      if (msg.cmd === 'kill') {
        console.log('killPid', msg.pid);
        // console.log(cluster.workers);
        for (const id in cluster.workers) {
          if (cluster.workers[id].process.pid === Number(msg.pid)) {
            willBeKilledWoker = cluster.workers[id];
          }
        }
        // const willBeKilledWoker = cluster.workers;
        if (willBeKilledWoker) {
          willBeKilledWoker.disconnect();
          willBeKilledWoker.send({ cmd: "shutdown" });
        } else {
          console.log(msg.pid, 'not found');
        }
      } else {
        // worker.send({ cmd: "shutdown", pid: msg.pid });
      }
    });
  }
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server

  const { indexRouter } = require("./routes");
  app.use(indexRouter.routes()).use(indexRouter.allowedMethods());

  const server = http.createServer(app.callback()).listen(8000);

  process.on("message", (msg) => {
    const { cmd } = msg;
    if (cmd === "shutdown") {
      // Initiate graceful close of any connections to server
      setTimeout(() => {
        console.log('process exit');
        process.exit(1);
      }, 30000);

      server.close();
    } else {
      console.log({msg});
    }
  });

  console.log(`Worker ${process.pid} started`);
}
