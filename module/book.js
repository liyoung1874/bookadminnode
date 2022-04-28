/* 
    构造 book 数据
*/
const fs = require('fs');
const { MIME_TYPE_EPUB, UPLOAD_PATH, UPLOAD_URL } = require('../utils/constent');
class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFormFile(file);
        } else {
            this.createBookFormData(data);
        }
    }

    createBookFormFile(file) {
        const { destination, filename, originalname, mimetype = MIME_TYPE_EPUB } = file;
        // 定义后缀名
        const bookSuffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '.png';
        // 文件的原路径
        const bookOldPath = `${destination}/${filename}`;
        // 文件的 url
        const bookUrl = `${UPLOAD_URL}/${filename}${bookSuffix}`;
        // 解压后的文件 url
        const bookUnzipUrl = `${UPLOAD_URL}/unzip/`;
        // 解压后的文件路径
        const bookUnzipPath = `${UPLOAD_PATH}/unzip/`;
        // 判断解压后的目录存不存在
        if (!fs.existsSync(bookUnzipPath)) {
            fs.mkdirSync(bookUnzipPath, { recursive: true })
        }
        // 判断是否重名
        if (!fs.existsSync(bookOldPath) && !fs.existsSync(bookUrl)) {
            fs.renameSync(bookOldPath, bookUrl)
        }
        // 构建出数据库中对应的字段
        this.fileName = filename;
        this.title = '';
        this.cover = '';
        this.author = '';
        this.publisher = '';
        this.category = -1;
        this.categoryText = '';
        this.language = '';
        this.contents = [];
        this.url = bookUrl;
        this.path = bookOldPath;
        this.filePath = this.path;
        this.unzipPath = bookUnzipPath;
        this.unzipUrl = bookUnzipUrl;
        this.originalname = originalname;
        return this;
    }

    createBookFromData(data) {
        this.fileName = data.fileName
        this.cover = data.coverPath
        this.title = data.title
        this.author = data.author
        this.publisher = data.publisher
        this.bookId = data.fileName
        this.language = data.language
        this.rootFile = data.rootFile
        this.originalName = data.originalName
        this.path = data.path || data.filePath
        this.filePath = data.path || data.filePath
        this.unzipPath = data.unzipPath
        this.coverPath = data.coverPath
        this.createUser = data.username
        this.createDt = new Date().getTime()
        this.updateDt = new Date().getTime()
        this.updateType = data.updateType === 0 ? data.updateType : UPDATE_TYPE_FROM_WEB
        this.contents = data.contents
    }
}


module.exports = Book;