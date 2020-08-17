const path = require('path');

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");

const { options } = require("../utils");

const helloworldProtoFileName = path.resolve(__dirname, "../protos/helloworld.proto");
const helloworldPackageDefinition = protoLoader.loadSync(
  helloworldProtoFileName,
  options
);
const helloworldObject = grpc.loadPackageDefinition(
  helloworldPackageDefinition
);

const Greater = helloworldObject.helloworld.Greeter;

exports.helloworldService = Greater.service;
exports.helloworldServiceHandler = {
  sayHello: (call, callback) => {
    const { metadata, request } = call; // {Http2ServerCallStream, cancelled:false}
    call.sendMetadata(metadata);
    const { name } = request;
    callback(null, { message: `hello ${process.pid}  ${name}` });
  },
};