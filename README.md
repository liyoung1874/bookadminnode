# 简介

此项目是一个前后端分离，前后端语言都使用 js 构建的一个 epub 图书管理项目。其中前端基于 Vue-element-admin 二次开发，后端基于 express；主要功能包含用户登录，用户token鉴权，epub文件自动解析，电子书列表，电子书新增，电子书编辑等。

# 安装

### 前端
` git clone https://github.com/Pepper1874/bookadminvue.git `

` cd bookadminvue `

` npm i `

### 后端
` https://github.com/Pepper1874/bookadminnode.git `

` cd bookadminnode `

` npm i `
# 配置服务端

使用 nginx，需启动 nginx，并按照 utils 文件夹下的 constant.js 文件的常量配置对应的存储路径，或者是替换 nginx 配置文件里的路径。


# 配置 mysql

按照 db 文件夹下的 config.js 修改对应配置就可以，或者将配置项的修改为本机的配置。

# 启动

### 后端
`node app.js`
### 前端
`npm run dev`
