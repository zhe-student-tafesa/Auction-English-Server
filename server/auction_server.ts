import  * as express from 'express';
import {Server} from 'ws';
import * as path from 'path';

const app =express();
export class Product {
    constructor(
        public id: number,
        public title: string,
        public price: number,
        public rating: number,
        public desc: string,
        public categories: Array<string>
    ) {
    }
}

export class Comment{

    constructor(
        public id:number,
        public productId:number,
        public timestamp:string,
        public user:string,
        public rating:number,
        public content:string

    ) {
    }

}
const products: Product[]= [
    new Product(1,"The first product name: IBM",  1.99,4.5,"IBM produces and sells computer hardware and software, and provides hosting services in areas ranging from mainframe computers to nanotechnology. ",["IT","hardware"]),
    new Product(2,"The second product name: TSLA",2.99,3.5,"Tesla is the world's earliest manufacturer of self-driving cars. By 2018, Tesla Motors has become the world's best-selling plug-in car company.",["Tech","IT"]),
    new Product(3,"The third product name: AAPL", 3.99,1.5,"Apple’s business includes design, development, mobile communications and sales of consumer electronics, computer software and personal computers",["IT","hardware"]),
    new Product(4,"The fourth product name: AMZN",4.99,4,  "Amazon is a multinational e-commerce company headquartered in Seattle, USA. It is currently one of the world's largest Internet online retailers",["Tech","E-commerce"]),
    new Product(5,"The fifth product name: GOOG", 5.99,4,  "Google's business scope covers Internet advertising, Internet search, cloud computing and other fields. And its main profit comes from advertising services such as Ads.",["Tech","Ads"]),
    new Product(6,"The sixth product name: FB",   6.99,5,  "Meta Platforms, Inc. is an American Internet technology company operating social network services, virtual reality, meta universe and other products",["Social network","Tech"])
];
//声明一个本地的数组包含评论的信息
const comments:Comment[]=[
    new Comment(1,1,"2021-6-27 15:09:00","San",2,"bad stuff"),
    new Comment(1,2,"2021-8-17 15:09:00","Tom",4,"Good stuff"),
    new Comment(2,1,"2021-7-27 16:09:00","Jim",3,"just so so"),
    new Comment(3,1,"2021-8-27 17:00:00","Williams",5,"very good stuff"),
    new Comment(1,3,"2021-9-27 15:09:00","Daiden",3,"Bad user experience"),
    new Comment(4,1,"2021-9-27 20:00:08","Chuanpu",4,"Things are of good quality")
];


// 在根目录下，如果收到 get 请求，服务器 返回 hello Express
// app.get('/',(req,res)=>{
//     res.send("hello express");
// });

//部署时根目录,希望express 找静态 目录，..代表上一级，默认 找index.html， client/index.html
app.use('/',express.static(path.join(__dirname,'..','client')));

// 在products目录下，如果收到 get 请求，服务器  发送  接收到商品查询请求
app.get('/api/products',(req,res)=>{
    //search 过滤开始
    let result=products;

    let params=req.query;//获取搜索 条件
    //10.13 张哲添加,if 没有搜索，则直接返回  开始
    console.log(params);
    if(!params.category && !params.price && !params.title){
        console.log("空空");
        res.json(result);//返回客户端 这些数据
    }else {
        //10.13 张哲添加,if 没有搜索，则直接返回  结束
        if(params.title){
            //  如果 商品title中不包含（!==-1） params.title，则过滤掉
            // @ts-ignore
            result=result.filter((p)=>p.title.indexOf(params.title)!==-1);
        }
        if(params.price && result.length>0){ //如果经过第一个过滤 后，还有数据
            //  如果 商品价格小于 搜索的价格   params.title，则保留
            // @ts-ignore
            result=result.filter((p)=>p.price<=parseInt(params.price));///////p就相当于 result
        }
        if(params.category!=="-1" && result.length>0){ //如果经过第一个过滤 后，且（-1代表全选）不是全选时 需要 过滤
            //  如果 商品category中不包含（!==-1） params.category
            // @ts-ignore
            result=result.filter((p)=>p.categories.indexOf(params.category)!==-1);///////p就相当于 result
        }


        //search 过滤结束
        res.json(result);//返回客户端 这些数据
    }


});













// 在products/id目录下，如果收到 get 请求，服务器  发送给 客户端 这个id的商品 信息
app.get('/api/product/:id',(req,res)=>{
    // @ts-ignore
    res.json(products.find((product)=>product.id==req.params.id));//返回客户端 这些数据
});


// 在products/id/comments目录下，如果收到 get 请求，服务器  发送给 客户端 这个id的商品 de评论
app.get('/api/product/:id/comments',(req,res)=>{
    // @ts-ignore
    res.json(comments.filter((comment:Comment)=>comment.productId==req.params.id));//返回客户端 这些数据
});


//启动server
const server=app.listen(8000,"localhost",()=>{
    console.log("服务器已启动，地址是：http://localhost:8000");//启动后 在 本地打印
})






const subscriptions=new Map<any,number[]>();//把商品id放在这个集合里       number[]：存放商品id的数组
const  wsServer= new Server({port:8085});//在 8085端口创建 服务器
//当连接时，调用 一个匿名函数
wsServer.on("connection",websocket=>{//当连接时,发送 "这个消息是服务器主动推送的"
    websocket.send("这个消息是服务器主动推送的");
    websocket.on("message",message=>{
        console.log("接收到消息"+message);
        //收到消息后，先进行转换,string转换为js对象
        // @ts-ignore
        let messageObj=JSON.parse(message);//  {productId:id}
        //第一次收到消息时，subscriptions.get(websocket)为空，则把[]进行赋值。后续收到消息时，先把以前的数据读出来，赋值给productId
        let productIds=subscriptions.get(websocket)||[];// Map的key就是特定的客户端，即客户端的websocket   number[]：存放商品id的数组
        //然后把老id们加上 新发送的id 一起赋值给 Map
        subscriptions.set(websocket,[...productIds,messageObj.productId]);
    });
});

//声明一个集合，保存 商品的最新价格
const currentBids=new Map<number,number>();//key是商品id，值是最新价格
//每2秒更新一下商品的价格（），真实的环境里，这个值应该是客户端发送上来的
//定时(2S) 向客户端 推送消息
setInterval(()=>{
    //每2秒更新一下商品的价格（），真实的环境里，这个值应该是客户端发送上来的

    //为所有商品做循环forEach，赋值最新价格
    products.forEach(p=>{//p就代表 products数组中的元素
        let currentBid= currentBids.get(p.id)||p.price;//currentBids.get(p.id)通过id拿到商品最新出价  或者 还没有最新出价则拿商品原价
        //在最新价格上生成一个新的出价，加随机的0~5 -1.5元
        let newBid=currentBid+Math.random()*5-1.5;
        //使用 key value 更新 Map
        currentBids.set(p.id,newBid);
    });

    //循环map时，匿名函数需要有2个元素[[[ 第一个元素是ids，第二个是 客户端ws：张哲 修改类型为字符串。]]]   普通数组foreach只有1个元素
    subscriptions.forEach((productIds:number[],ws)=>{
        if(ws.readyState===1){//发送前，确认客户端 还连着
            let newBids=productIds.map(pid=>({  //把id转换成一个对象，他有2个属性 {producId:pid, bid:currentBids.get(pid) }
                producId:pid,
                bid:currentBids.get(pid)
            }));
            ws.send(JSON.stringify(newBids));//把对象转成 字符串，然后发送 给客户端
            console.log("成功推送最新价格");
        }else {//不连了，则删除 这个客户端
            subscriptions.delete(ws);
        }

    });

    // if(wsServer.clients){//判断是否有客户端在连接
    //     //如果有，循环所有的客户端    回调
    //     wsServer.clients.forEach(client=>{
    //         client.send("这是定时推送");//向所有客户端 广播 消息
    //     });
    // }

},2000);