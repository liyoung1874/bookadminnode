const Book = require('../module/book');
const db = require('../db')

function exists (book){ 
  return false;
}

function removeBook (book){ 
  return new Promise((resolve,reject) => {

  })
}

function insertContents (book){ 
  return new Promise((resolve,reject) => {

  })
}

function insertBook (book){ 
  return new Promise( async (resolve, reject) => {
    try {
      if(book instanceof Book){
        const result = exists(book);
        if(result){
          await removeBook(book);
          reject(new Error('电子书已存在'))
        }else{
          await db.insert(book.toDB(), 'book');
          await insertContents(book);
          resolve()
        }
      } else {
        reject(new Error('添加的电子书对象不合法'))
      }
    } catch (error) {
      reject(error)
    }
  })
 }

 module.exports = {
  insertBook
 }