/* 
jwt token 鉴权
*/
const { expressjwt } = require('express-jwt');
const { PRIVATE_KEY } = require('../utils/constent');

const jwtAuth = expressjwt({
    secret: PRIVATE_KEY,
    algorithms: ['HS256'],
    credentialsRequired: true, // 是否进行校验，设置为 false 则不进行校验
}).unless({
    // 验证白名单
    path: [
        '/',
        '/user/login'
    ]
})

module.exports = jwtAuth;