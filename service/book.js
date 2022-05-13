const Book = require('../module/book');
const db = require('../db');
const _ = require('lodash');
const { reject } = require('lodash');

// 判断电子书存在
function exists(book) {
  const { title, author, publisher } = book;
  const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`;
  return db.qeuryOne(sql);
}

// 移除电子书
async function removeBook(book) {
  if (book) {
    book.reset();
    if (book.fileName) {
      const removeBookSql = `delete from book where fileName='${book.fileName}'`;
      await db.querySql(removeBookSql);
      const removeBookContentsSql = `delete from contents where fileName='${book.fileName}'`;
      await db.querySql(removeBookContentsSql);
    }
  }
}

// 插入目录
async function insertContents(book) {
  const contents = book.contents;
  if (contents && contents.length > 0) {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      const _content = _.pick(content, [
        'fileName',
        'id',
        'level',
        'text',
        'href',
        'order',
        'label',
        'pid',
        'navId'
      ])
      await db.insert(_content, 'contents');
    }
  }
}

// 插入电子书
function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await exists(book);
        if (result) {
          await removeBook(book);
          reject(new Error('电子书已存在'))
        } else {
          await db.insert(book.toDB(), 'book');
          await insertContents(book);
          resolve();
        }
      } else {
        reject(new Error('添加的电子书对象不合法'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 更新电子书
function updateBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await getBook(book.fileName);
        if (result) {
          const model = book.toDB();
          if (+result.book.updateType === 0) {
            reject(new Error('内置图书不能编辑'));
          } else {
            await db.update(model, 'book', `where fileName='${book.fileName}'`);
            resolve();
          }
        }
      } else {
        reject(new Error('添加的电子书对象不合法'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 获取电子书
function getBook(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const sqlBook = `select * from book where fileName='${fileName}'`;
      const sqlBookContents = `select * from contents where fileName='${fileName}' order by \`order\``;
      const data = await db.querySql(sqlBook);
      const contentTree = await db.querySql(sqlBookContents);
      if (data && data.length > 0) {
        let book = data[0];
        const { cover } = book;
        if (cover) {
          book.cover = Book.genUrl(cover);
        } else {
          book.cover = null;
        }
        if (contentTree && contentTree.length > 0) {
          book.contentTree = Book.genContents(contentTree);
          resolve({ book });
        } else {
          reject(new Error('电子书目录不存在'))
        }
      } else {
        reject(new Error('电子书不存在'))
      }
    } catch (err) {
      reject(err);
    }
  })
}

// 获取分类
function getCategory() {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `select * from category order by category asc`;
      const result = await db.querySql(sql);
      const categoryList = [];
      result.forEach(item => {
        categoryList.push({
          value: item.category,
          label: item.categoryText,
          num: item.num,
        })
      })
      resolve(categoryList);
    } catch (err) {
      reject(err)
    }
  })
}

// 获取电子书列表
function getBookList(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const { title, author, category, pageNum = 1, pageSize = 30, sort } = query;
      let sql = `select * from book`;
      // 查询总数
      let countSql = `select count(*) as count from book`;
      let where = `where`;
      const offset = (pageNum - 1) * pageSize;
      title && (where = db.like(where, 'title', title));
      author && (where = db.like(where, 'author', author));
      category && (where = db.add(where, 'category', category));
      if (where !== 'where') {
        sql = `${sql} ${where}`;
        countSql = `${countSql} ${where}`;
      }
      if (sort) {
        const symbol = sort[0];
        const column = sort.slice(1, sort.length);
        const order = symbol === '+' ? 'asc' : 'desc';
        sql = `${sql} order by \`${column}\` ${order}`;
      }
      sql = `${sql} limit ${pageSize} offset ${offset}`;
      let list = await db.querySql(sql);
      let count = await db.querySql(countSql);
      resolve({ list, count: count[0].count });
    } catch (err) {
      reject(err)
    }
  })
}

// 删除电子书
function deleteBook(fileName) {
  return new Promise(async (resolve, reject) => {
    let { book } = await getBook(fileName);
    if (book) {
      if (+book.updateType === 0) {
        reject(new Error('内置图书不能删除'));
      } else {
        const bookObj = new Book(null, book);
        const sql = `delete from book where fileName='${fileName}'`;
        db.querySql(sql)
          .then(() => {
            bookObj.reset();
            resolve();
          })
      }
    } else {
      reject(new Error('电子书不存在'))
    }
  })
}

module.exports = {
  insertBook,
  updateBook,
  getBook,
  getCategory,
  getBookList,
  deleteBook
}