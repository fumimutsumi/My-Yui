/**
 * backend/app.js
 * 应用主入口：配置 Express 中间件，注册路由，导出 app 供 server.js 启动
 */
const express = require('express');          // Web 框架
const cors = require('cors');                // 跨域中间件

const app = express();

// ========== 全局中间件 ==========
app.use(express.json());                     // 解析 JSON 请求体
app.use(cors());                             // 允许所有跨域请求（开发环境方便）

// ========== 引入路由模块 ==========
const categoriesRouter = require('./routes/categories');
const notesRouter = require('./routes/notes');
const tagsRouter = require('./routes/tags');

// ========== 注册路由 ==========
// 所有 /api/categories 开头的请求交给 categoriesRouter 处理
app.use('/api/categories', categoriesRouter);
// 所有 /api/notes 开头的请求交给 notesRouter 处理
app.use('/api/notes', notesRouter);
// 所有 /api/tags 开头的请求交给 tagsRouter 处理
app.use('/api/tags', tagsRouter);

// ========== 根路由测试 ==========
app.get('/', (req, res) => {
  res.send('Hello from My-Yui backend!');
});

// 导出 app 实例，供 server.js 使用
module.exports = app;