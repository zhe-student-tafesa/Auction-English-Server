import  * as http from 'http'
const server = http.createServer((request,response)=>{
    response.end("Hello Node");
});
//启动服务器
server.listen(8000);