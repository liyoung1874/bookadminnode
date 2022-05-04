// 引入
const express = require('express');
const router = express.Router();
const Result = require('../module/result');
const multer = require('multer');
const { UPLOAD_PATH } = require('../utils/constent');
const upload = multer({ dest: `${UPLOAD_PATH}` });
const Book = require('../module/book');
const boom = require('boom');
const { decode } = require('../utils');
const bookService = require('../service/book')
// 定义接口
// 电子书文件上传
router.post('/upload',
    upload.single('file'),
    (req, res, next) => {
        if (!req.file || req.file.length === 0) {
            new Result('上传电子书失败').fail(res);
        } else {
            const book = new Book(req.file);
            book.parse()
                .then(book => {
                    new Result(book, '上传电子书成功').success(res);
                })
                .catch(err => {
                    next(boom.badImplementation(err));
                })
        }
    }
)

// 新增电子书
router.post('/create', (req, res, next) => {
    const decoded = decode(req);
    if(decoded && decoded.username){
        req.body.username = decoded.username;
    }
    const book = new Book(null, req.body);
    bookService.insertBook(book)
        .then(() => {

        })
        .catch(err => {
            next(boom.badImplementation(err));
        })
})

module.exports = router;