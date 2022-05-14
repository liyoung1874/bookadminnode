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
const bookService = require('../service/book');

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
    if (decoded && decoded.username) {
        req.body.username = decoded.username;
    }
    const book = new Book(null, req.body);
    bookService.insertBook(book)
        .then(() => {
            new Result('上传电子书成功').success(res);
        })
        .catch(err => {
            next(boom.badImplementation(err));
        })
})

// 更新电子书
router.post('/update', (req, res, next) => {
    const decoded = decode(req);
    if (decoded && decoded.username) {
        req.body.username = decoded.username;
    }
    const book = new Book(null, req.body);
    bookService.updateBook(book)
        .then(() => {
            new Result('更新电子书成功').success(res);
        })
        .catch(err => {
            next(boom.badImplementation(err));
        })
})

// 查询电子书
router.get('/get', (req, res, next) => {
    const { fileName } = req.query;
    if (!fileName) {
        next(boom.badRequest(new Error('查询参数 fileName 不能为空')))
    } else {
        bookService.getBook(fileName)
            .then((book) => {
                new Result(book, '获取电子书成功').success(res);
            })
            .catch(err => {
                new Result('获取电子书失败').file(err);
            })
    }
})

// 获取图书分类
router.get('/category', (req, res, next) => {
    bookService.getCategory()
        .then(category => {
            new Result(category, '获取分类成功').success(res);
        })
        .catch(err => {
            next(boom.badRequest(err))
        })
})

// 获取图书列表
router.post('/list', (req, res, next) => {
    const query = req.query;
    bookService.getBookList(query)
        .then(({ list, count }) => {
            new Result({ list, count }, '获取电子书列表成功').success(res);
        })
        .catch(err => {
            next(boom.badImplementation(err));
        })
})

// 删除图书
router.get('/delete', (req, res, next) => {
    const { fileName } = req.query;
    if (!fileName) {
        next(boom.badRequest(new Error('参数 fileName 不能为空')))
    } else {
        bookService.deleteBook(fileName)
            .then(() => {
                new Result('删除电子书成功').success(res);
            })
            .catch((error) => {
                next(boom.badImplementation(error));
            })
    }
})

module.exports = router;