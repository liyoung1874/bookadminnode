// 引入
const crypto = require('crypto'); // 用于处理 MD5 加密
const jwt = require('jsonwebtoken');
const { PRIVATE_KEY } = require('../utils/constent');

function isObject(o){
    return Object.prototype.toString.call(o) === '[object Object]';
}

// md5 加密
function md5(str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
}

// token 解析
function decode(req) {
    const auth = req.get('Authorization');
    let token = '';
    if (auth.indexOf('Bearer') > -1) {
        // 此处的 Bearer 后有一空格
        token = auth.replace('Bearer ', '')
    } else {
        token = auth;
    }
    return jwt.verify(token, PRIVATE_KEY, { algorithms: ['HS256'] });
}

module.exports = {
    md5,
    decode,
    isObject,
}