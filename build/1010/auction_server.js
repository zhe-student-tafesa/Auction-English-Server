"use strict";
exports.__esModule = true;
exports.Comment = exports.Product = void 0;
var express = require("express");
var ws_1 = require("ws");
var app = express();
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [new Product(1, "第一个商品名称", 1.99, 4.5, "第一个商品描述", ["电子产品", "硬件设备"]),
    new Product(2, "第二个商品名称", 2.99, 3.5, "第二个商品描述", ["图书", "IT"]),
    new Product(3, "第三个商品名称", 3.99, 1.5, "第三个商品描述", ["电子产品", "硬件设备"]),
    new Product(4, "第四个商品名称", 4.99, 4, "第四个商品描述", ["电子产品", "手机"]),
    new Product(5, "第五个商品名称", 5.99, 4, "第五个商品描述", ["电子产品", "硬件设备"]),
    new Product(6, "第六个商品名称", 6.99, 5, "第六个商品描述", ["通信", "硬件设备"])
];
//声明一个本地的数组包含评论的信息
var comments = [
    new Comment(1, 1, "2021-6-27 15:09:00", "ZhangSan", 2, "东西不错"),
    new Comment(1, 2, "2021-8-17 15:09:00", "ZhangSan", 4, "东西不错啊"),
    new Comment(2, 1, "2021-7-27 16:09:00", "李四", 3, "东西真不错"),
    new Comment(3, 1, "2021-8-27 17:00:00", "王五", 5, "东西非常好"),
    new Comment(1, 3, "2021-9-27 15:09:00", "ZhangSan", 3, "东西不错嘛"),
    new Comment(4, 1, "2021-9-27 20:00:08", "赵六", 4, "东西不错呀")
];
// 在根目录下，如果收到 get 请求，服务器 返回 hello Express
app.get('/', function (req, res) {
    res.send("hello express");
});
// 在products目录下，如果收到 get 请求，服务器  发送  接收到商品查询请求
app.get('/api/products', function (req, res) {
    //search 过滤开始
    var result = products;
    var params = req.query; //获取搜索 条件
    if (params.title) {
        //  如果 商品title中不包含（!==-1） params.title，则过滤掉
        // @ts-ignore
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) { //如果经过第一个过滤 后，还有数据
        //  如果 商品价格小于 搜索的价格   params.title，则保留
        // @ts-ignore
        result = result.filter(function (p) { return p.price <= parseInt(params.price); }); ///////p就相当于 result
    }
    if (params.category !== "-1" && result.length > 0) { //如果经过第一个过滤 后，且（-1代表全选）不是全选时 需要 过滤
        //  如果 商品category中不包含（!==-1） params.category
        // @ts-ignore
        result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; }); ///////p就相当于 result
    }
    //search 过滤结束
    res.json(result); //返回客户端 这些数据
});
// 在products/id目录下，如果收到 get 请求，服务器  发送给 客户端 这个id的商品 信息
app.get('/api/product/:id', function (req, res) {
    // @ts-ignore
    res.json(products.find(function (product) { return product.id == req.params.id; })); //返回客户端 这些数据
});
// 在products/id/comments目录下，如果收到 get 请求，服务器  发送给 客户端 这个id的商品 de评论
app.get('/api/product/:id/comments', function (req, res) {
    // @ts-ignore
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; })); //返回客户端 这些数据
});
//启动server
var server = app.listen(8000, "localhost", function () {
    console.log("服务器已启动，地址是：http：//localhost：8000"); //启动后 在 本地打印
});
var wsServer = new ws_1.Server({ port: 8085 }); //在 8085端口创建 服务器
//当连接时，调用 一个匿名函数
wsServer.on("connection", function (websocket) {
    websocket.send("这个消息是服务器主动推送的");
    websocket.on("message", function (message) {
        console.log("接收到消息" + message);
    });
});
//定时(2S) 向客户端 推送消息
setInterval(function () {
    if (wsServer.clients) { //判断是否有客户端在连接
        //如果有，循环所有的客户端    回调
        wsServer.clients.forEach(function (client) {
            client.send("这是定时推送"); //向所有客户端 广播 消息
        });
    }
}, 2000);
