/* 
对请求结果进行统一的封装
*/
const { CODE_ERROR, CODE_SUCCESS, CODE_EXPIRED } = require('../utils/constent');

class Result {
    // 构造函数
    constructor(data, msg = '操作成功', options) {
        this.data = null;
        if (arguments.length === 0) {
            this.msg = "操作成功";
        } else if (arguments.length === 1) {
            this.msg = data;
        } else {
            this.data = data;
            this.msg = msg;
            if (options) {
                this.options = options;
            }
        }
    }

    // 创建数据
    createResult() {
        if (!this.code) {
            this.code = CODE_SUCCESS;
        }
        let base = {
            code: this.code,
            msg: this.msg,
        }
        if (this.data) {
            base.data = this.data
        }
        if (this.options) {
            base = { ...base, ...this.options }
        }
        console.log('base', base);
        return base;
    }

    // 结果装换为 json
    json(res) {
        res.json(this.createResult())
    }

    // 成功的回调
    success(res) {
        this.code = CODE_SUCCESS;
        this.json(res);
    }

    // 失败的回调
    fail(res) {
        this.code = CODE_ERROR;
        this.json(res);
    }

    // token 过期
    expried(res) {
        this.code = CODE_EXPIRED;
        this.json(res);
    }
}

module.exports = Result;