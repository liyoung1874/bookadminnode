/* 
    构造 book 数据
*/
const fs = require('fs');
const path = require('path');
const Epub = require('../utils/epub');
const xml2js = require('xml2js').parseString;
const { MIME_TYPE_EPUB, UPLOAD_PATH, UPLOAD_URL, UPDATE_TYPE_FROM_WEB } = require('../utils/constent');
class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFormFile(file);
        } else {
            this.createBookFormData(data);
        }
    }

    createBookFormFile(file) {
        console.log('createBookFormFile', file)
        const { destination, filename, originalname, mimetype = MIME_TYPE_EPUB, path } = file;
        // 定义后缀名
        const bookSuffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '';
        // 文件的原路径
        const bookOldPath = path;
        // 文件新路径
        const bookPath = `${destination}/book/${filename}${bookSuffix}`;
        // 文件的下载 url
        const bookUrl = `${UPLOAD_URL}/book/${filename}${bookSuffix}`;
        // 文件解压后的文件夹路径
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`;
        // 文件解压后的下载 url
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`;
        // 判断解压后的目录存不存在
        if (!fs.existsSync(unzipPath)) {
            fs.mkdirSync(unzipPath, { recursive: true })
        }
        // 判断是否重名
        if (fs.existsSync(bookOldPath) && !fs.existsSync(bookPath)) {
            fs.renameSync(bookOldPath, bookPath)
        }
        // 构建出数据库中对应的字段
        this.fileName = filename;
        this.originalName = originalname;
        this.path = `/book/${filename}${bookSuffix}`; // 相对路径
        this.filePath = this.path;
        this.url = bookUrl; // epub 下载链接
        this.unzipPath = `/unzip/${filename}`;
        this.unzipUrl = unzipUrl;
        this.title = '';
        this.cover = '';
        this.coverPath = '';
        this.author = '';
        this.publisher = '';
        this.category = '';
        this.categoryText = '';
        this.language = '';
        this.contents = [];
        this.contentTree = [];
    }

    createBookFormData(data) {
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
        this.contents = data.contents || [];
        this.category = data.category || 99;
        this.categoryText = data.categoryText || '自定义';
    }

    parse() {
        return new Promise((resolve, reject) => {
            // 判断电子书路径存不存在，不存在直接返回 error
            const bookPath = `${UPLOAD_PATH}${this.filePath}`;
            if (!fs.existsSync(bookPath)) {
                reject(new Error('电子书路径不存在，解析失败'))
            }
            // 实例化 epub 电子书 并监听解析事件
            const epub = new Epub(bookPath);
            // 解析错误
            epub.on('error', err => {
                reject(err)
            })
            // 解析结束
            epub.on('end', err => {
                if (err) {
                    reject(err)
                } else {
                    // 解构出需要的属性
                    const {
                        title,
                        creator,
                        creatorFileAs,
                        publisher = 'unknown',
                        language,
                        cover,
                    } = epub.metadata;
                    // 判断电子书的书名是否存在如果不存在，直接中断逻辑
                    if (!title) {
                        reject(new Error('电子书书名不存在，解析失败'));
                    } else {
                        this.title = title;
                        this.author = creator || creatorFileAs || 'unknown';
                        this.publisher = publisher;
                        this.language = language || 'en';
                        this.rootFile = epub.rootFile; // 电子书资源根目录
                        // 解压电子书资源
                        const handleGetImage = (err, file, mimetype) => {
                            if (err) {
                                reject(err)
                            } else {
                                // 拼接图片路径
                                const suffix = mimetype.split('/')[1];
                                const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`;
                                const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`;
                                // 将图片资源的二进制file 写入到磁盘中
                                fs.writeFileSync(coverPath, file, 'binary');
                                // 赋值
                                this.coverPath = `/img/${this.fileName}.${suffix}`;
                                this.cover = coverUrl;
                                resolve(this);
                            }
                        }
                        try {
                            this.unzip();
                            this.parseContents(epub)
                                // 解析电子书目录
                                .then(({ chapters, chapterTree }) => {
                                    this.contents = chapters;
                                    this.contentTree = chapterTree;
                                    // 获取电子书封面
                                    epub.getImage(cover, handleGetImage)
                                })
                                .catch(err => {
                                    reject(err)
                                });
                        } catch (error) {
                            reject(error);
                        }
                    }
                }
            })
            // 启动解析过程
            epub.parse()
        })

    }

    /* 解压电子书资源 */
    unzip() {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(Book.genPath(this.path));
        zip.extractAllTo(Book.genPath(this.unzipPath), true);
    }

    /* 解析电子书目录 */
    parseContents(epub) {
        // 获取目录文件的路径
        function getNcxFilePath() {
            const spine = epub && epub.spine;
            const manifest = epub && epub.manifest;
            const ncx = spine.toc && spine.toc.href;
            const id = spine.toc && spine.toc.id;
            if (ncx) {
                return ncx;
            } else {
                return manifest[id];
            }
        }
        // findParent
        function findParent(array, level = 0, pid = '') {
            return array.map(item => {
                item.level = level;
                item.pid = pid;
                if (item.navPoint && item.navPoint.length > 0) {
                    item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
                } else if (item.navPoint) {
                    item.navPoint.level = level + 1;
                    item.navPoint.pid = item['$'].id;
                }
                return item;
            })
        }
        // flatten
        function flatten(array) {
            return [].concat(...array.map(item => {
                if (item.navPoint && item.navPoint.length > 0) {
                    return [].concat(item, ...flatten(item.navPoint))
                } else if (item.navPoint) {
                    return [].concat(item, item.navPoint)
                }
                return item;
            }))
        }
        const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`);
        if (fs.existsSync(ncxFilePath)) {
            return new Promise((resolve, reject) => {
                // 读取 buffer 对象
                const xml = fs.readFileSync(ncxFilePath, 'utf-8');
                const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, '');
                const fileName = this.fileName;
                const unzipPath = this.unzipPath;
                xml2js(xml, {
                    explicitArray: false,
                    ignoreAttrs: false,
                }, (err, json) => {
                    if (err) {
                        reject(err)
                    } else {
                        const navMap = json.ncx.navMap;
                        if (navMap.navPoint && navMap.navPoint.length > 0) {
                            navMap.navPoint = findParent(navMap.navPoint);
                            // 将树状结构转换为数组
                            const newNavMap = flatten(navMap.navPoint);
                            const chapters = [];
                            // 生成章节的路径
                            newNavMap.forEach((chapter, index) => {
                                const src = chapter.content['$'].src;
                                // 目录路径
                                chapter.id = `${src}`;
                                chapter.href = `${dir}/${src}`.replace(unzipPath, '');
                                chapter.text = `${UPLOAD_URL}/${dir}/${src}`;
                                chapter.label = chapter.navLabel.text || '';
                                chapter.navId = chapter['$'].id;
                                chapter.fileName = fileName;
                                chapter.order = index + 1;
                                chapters.push(chapter);
                            });
                            // 生成前端方便展示的树形图
                            const chapterTree = Book.genContents(chapters);
                            resolve({ chapters, chapterTree });
                        } else {
                            reject(new Error('电子书目录树长度为 0，解析失败'))
                        }
                    }
                })
            })
        } else {
            throw new Error('电子书目录资源不存在，解析失败');
        }
    }

    /* 生成数据库需要的对象 */
    toDB() {
        return {
            fileName: this.fileName,
            cover: this.coverPath,
            title: this.title,
            author: this.author,
            publisher: this.publisher,
            bookId: this.fileName,
            language: this.language,
            rootFile: this.rootFile,
            originalName: this.originalName,
            filePath: this.path,
            unzipPath: this.unzipPath,
            coverPath: this.coverPath,
            createUser: this.createUser,
            createDt: this.createDt,
            updateDt: this.updateDt,
            updateType: this.updateType,
            category: this.category,
            categoryText: this.categoryText,
        }
    }

    /* 获取电子书的目录数据 */
    getContents() {
        return this.contents;
    }

    /* 删除电子书文件 */
    reset() {
        if (Book.pathExists(this.filePath)) {
            fs.unlinkSync(Book.genPath(this.filePath));
        }
        if (Book.pathExists(this.coverPath)) {
            fs.unlinkSync(Book.genPath(this.coverPath));
        }
        if (Book.pathExists(this.unzipPath)) {
            fs.rmdirSync(Book.genPath(this.unzipPath), { recursive: true });
        }
    }

    /* 生成电子书绝度路径 */
    static genPath(path) {
        // 判断 path 是否以 / 开头
        if (!path.startsWith('/')) {
            path = `/${path}`
        }
        return `${UPLOAD_PATH}${path}`
    }

    /* 判断电子书的文件是否已经存在 */
    static pathExists(path) {
        if (path.startsWith(UPLOAD_PATH)) {
            return fs.existsSync(path);
        } else {
            return fs.existsSync(Book.genPath(path));
        }
    }

    /* 生成电子书的资源 url */
    static genUrl(path) {
        if (path.startsWith('/')) {
            return `${UPLOAD_URL}${path}`
        } else {
            return `${UPLOAD_URL}/${path}`
        }
    }

    /* 生成电子书目录 */
    static genContents(contents){
        const chapterTree = [];
        contents.forEach(c => {
            c.children = [];
            if (c.pid === '') {
                chapterTree.push(c)
            } else {
                const parent = contents.find(_ => _.navId === c.pid);
                parent.children.push(c);
            }
        })
        return chapterTree;
    }
}


module.exports = Book;