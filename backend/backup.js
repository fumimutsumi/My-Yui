/**
 * backend/backup.js
 * 手动备份数据库文件到 backups 目录
 * 运行方式：node backup.js
 * 会在 backups/ 下生成带时间戳的 .db 文件
 */
const fs = require('fs');
const path = require('path');

// ========== 配置路径 ==========
const source = path.join(__dirname, '../data.db');      // 原始数据库文件
const backupDir = path.join(__dirname, 'backups');      // 备份存放目录

// ========== 确保备份目录存在 ==========
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// ========== 生成带时间戳的文件名 ==========
const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // 替换 : 和 . 为 -，避免文件名非法
const dest = path.join(backupDir, `data-${timestamp}.db`);

// ========== 执行拷贝 ==========
try {
  fs.copyFileSync(source, dest);
  console.log(`✅ 备份成功: ${dest}`);
} catch (err) {
  console.error('❌ 备份失败:', err.message);
}