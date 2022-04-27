// user 相关的数据库查询
const { querySql, qeuryOne } = require('../db');

// 登录查询
function login(username, password) {
    // 切记 sql 语句的查询 字段值 得加上引号
    const sql = `select * from admin_user where username='${username}' and password='${password}'`;
    return querySql(sql);
}

// 查找用户信息
function findUser(username) {
    const sql = `select * from admin_user where username='${username}'`;
    return qeuryOne(sql);
}

module.exports = {
    login,
    findUser
}