/**
 * backend/server.js
 * 启动 Express 服务器，监听指定端口
 */
const app = require('./app');      // 引入上面配置好的应用
const PORT = 3000;                 // 后端服务端口

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});