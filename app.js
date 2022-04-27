// 引入
const express = require('express');
const bodyParser = require('body-parser'); // 用于解析请求参数
const cors = require('cors'); // 用于解决前后端跨域
// 创建应用
const app = express();

// 使用 body-parser 解析前端传入的请求参数
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

// 处理跨域
app.use(cors())

// 引入路由模块
const router = require('./router');
app.use('/',router);

// 监听端口 5000
const server = app.listen(5000, () => {
    const { port } = server.address();
    console.log(`Port ${port} is working ......`);
})