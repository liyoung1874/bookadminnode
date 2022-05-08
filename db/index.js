// 引入
const { query } = require('express');
const mysql = require('mysql');
const { host, port, user, password, database } = require('./config');
const debug = require('../utils/constent').debug;
const { isObject } = require('../utils');

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

function insert(model, table) {
    return new Promise((resolve, reject) => {
        if (isObject(model)) {
            const keys = [];
            const values = [];
            Object.keys(model).forEach(key => {
                if (model.hasOwnProperty(key)) {
                    keys.push(`\`${key}\``);
                    values.push(`'${model[key]}'`);
                }
            })
            if (keys.length > 0 && values.length > 0) {
                let sql = `INSERT INTO \`${table}\` (`
                const keysString = keys.join(',');
                const valuesString = values.join(',');
                sql = `${sql}${keysString}) VALUES (${valuesString})`;
                debug && console.log(sql);
                const conn = connect();
                try {
                    conn.query(sql, (err, result) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    })
                } catch (err) {
                    reject(err)
                } finally {
                    conn.end();
                }
            }else{
                reject(new Error('插入数据库失败，插入数据没有键、值'));
            }
        } else {
            reject(new Error('插入数据库失败，插入数据非对象'));
        }
    })
}

function update(model, table, where){
    return new Promise((resolve, reject) => {
        if(isObject(model)){
            const entry = [];
            Object.keys(model).forEach(key => {
                if(model.hasOwnProperty(key)){
                    entry.push(`\`${key}\`='${model[key]}'`);
                }
            })
            if(entry.length > 0){
                let sql = `UPDATE \`${table}\` SET`
                sql = `${sql} ${entry.join(',')} ${where}`;
                debug && console.log(sql);
                const conn = connect();
                try {
                    conn.query(sql, (err, result) => {
                        if(err){
                            reject(err)
                        }else{
                            resolve(result)
                        }
                    })
                } catch (error) {
                    reject(error)
                } finally {
                    conn.end()
                }
            }
        }else{
            reject(new Error('插入数据库失败，插入数据非对象'));
        }
    })
}

function add(where, k, v){
    if(where === 'where'){
        return `${where} \`${k}\`='${v}'`;
    }else{
        return `${where} and \`${k}\`='${v}'`;
    }
}

function like(where, k, v){
    if(where === 'where'){
        return `${where} \`${k}\` like '%${v}%'`;
    }else{
        return `${where} and \`${k}\` like '%${v}%'`;
    }
}
module.exports = {
    querySql,
    qeuryOne,
    insert,
    update,
    add,
    like
}