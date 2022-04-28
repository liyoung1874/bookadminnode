// 引入
const express = require('express');
const router = express.Router();
const Result = require('../module/result');
const multer = require('multer');
const { UPLOAD_PATH } = require('../utils/constent');
const upload = multer({ dest: `${UPLOAD_PATH}` });
const Book = require('../module/book');
// 定义接口
router.post('/upload',
    upload.single('file'),
    (req, res, next) => {
        if (!req.file || req.file.length === 0) {
            new Result('上传电子书失败').fail(res);
        } else {
            new Result(new Book(req.file), '上传电子书成功').success(res);
        }
    }
)

module.exports = router;