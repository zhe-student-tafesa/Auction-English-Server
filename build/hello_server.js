"use strict";
exports.__esModule = true;
var http = require("http");
var server = http.createServer(function (request, response) {
    response.end("Hello Node");
});
//启动服务器
server.listen(8000);
