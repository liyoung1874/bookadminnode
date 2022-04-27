// 引入
const express = require('express');
const router = express.Router();
const boom = require('boom');
const { body, validationResult } = require('express-validator'); // 用于前端数据的表单验证
const Result = require('../module/result');

// 引入数据查询
const { login, findUser } = require('../service/uesr');

// 引入 MD5 相关
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constent')
const { md5, decode } = require('../utils');

// 引入 token 相关
const jwt = require('jsonwebtoken');

// 登录接口
router.post('/login', [
    // 验证前端的请求参数
    body('username').isString().withMessage('username 参数不正确'),
    body('password').isString().withMessage('password 参数不正确')
], (req, res, next) => {
    const err = validationResult(req); // 获取参数验证的错误信息
    if (!err.isEmpty()) {
        const [{ msg }] = err?.errors;
        next(boom.badRequest(msg));
    } else {
        let { username, password } = req?.body;
        password = md5(`${password}${PWD_SALT}`);
        login(username, password).then(user => {
            if (!user || user.length === 0) {
                new Result('登陆失败').fail(res);
            } else {
                // 生成 token
                const token = jwt.sign(
                    { username }, PRIVATE_KEY, { expiresIn: JWT_EXPIRED }, { algorithms: ['HS256'] }
                )
                new Result({ token }, '登录成功').success(res);
            }
        })
    }
})

// 获取用户信息
router.get('/info', (req, res) => {
    const decoded = decode(req);
    console.log('token', decoded);
    if (decoded && decoded.username) {
        findUser(decoded.username)
            .then(user => {
                if (user) {
                    user.roles = [user.role];
                    new Result(user, '用户信息获取成功').success(res);
                } else {
                    new Result('获取用户信息失败').fail(res);
                }
            })
    } else {
        new Result('用户信息解析失败').fail(res);
    }
})

module.exports = router;