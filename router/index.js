// 引入
const express = require('express');
const router = express.Router();
const boom = require('boom');
const Result = require('../module/result');

// 引入路由模块
const useRouter = require('./user');
const bookRouter = require('./book');

// 引入 token 鉴权
const jwtAuth = require('../router/jwt');

// 使用鉴权
router.use(jwtAuth);

// 注册根路由
router.get('/', (req, res) => {
    res.send('Welcome to here...')
})

// （解耦）相关路由
router.use('/user', useRouter);
router.use('/book', bookRouter);

// 处理 404 
router.use((req, res, next) => {
    next(boom.notFound('接口不存在...'))
})

// 定义异常处理中间件
router.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        new Result(null, 'token 失效', {
            error: err.status,
            errMsg: err.message,
        }).expried(res.status(err.status));
    } else {
        const msg = err?.message || '系统错误';
        const statusCode = err?.output?.statusCode || 500;
        const errMsg = err?.output?.payload?.error || err.message;
        new Result(null, msg, {
            error: statusCode,
            errMsg
        }).fail(res.status(statusCode));
    }
})

module.exports = router;