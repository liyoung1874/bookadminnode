// 定义常量
module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    PWD_SALT: 'admin_imooc_node', // MD5 密钥
    PRIVATE_KEY: 'key_token_pepper_book_admin', // token 密钥
    JWT_EXPIRED: 60 * 60 * 60, // token 过期时间
    CODE_EXPIRED: -2, // token 过期标识码
    // UPLOAD_PATH: 'E:/workspace/bookdata/upload/book',
    UPLOAD_PATH: 'F:/WebProjects/ProjectBook/upload',
    UPLOAD_URL:'http://localhost:8089',
    MIME_TYPE_EPUB: 'application/epub+zip',
    UPDATE_TYPE_FROM_WEB: 1,
}