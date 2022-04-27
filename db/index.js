// 引入
const { query } = require('express');
const mysql = require('mysql');
const { host, port, user, password, database } = require('./config');
const debug = require('../utils/constent').debug;

// 连接数据库方法
function connect() {
    return mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
        multipleStatements: true,
    })
}

// 查询方法
function querySql(sql) {
    // 连接数据库
    const conn = connect();
    debug && console.log('sql', sql);
    return new Promise((resolve, reject) => {
        try {
            // 处理查询逻辑 失败 or 成功
            conn.query(sql, (err, results) => {
                if (err) {
                    debug && console.log('查询失败，原因' + JSON.stringify(err));
                    reject(err)
                } else {
                    debug && console.log('查询成功，结果' + JSON.stringify(results));
                    resolve(results)
                }
            })
        } catch (error) {
            reject(err)
        } finally {
            // 断开数据库连接
            conn.end()
        }
    })
}

function qeuryOne(sql) {
    return new Promise((resolve, reject) => {
        querySql(sql)
            .then(results => {
                if (results && results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = {
    querySql,
    qeuryOne
}