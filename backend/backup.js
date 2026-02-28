const fs = require('fs');
const path = require('path');

// 配置
const source = path.join(__dirname, '../data.db'); // 注意路径：从backend目录往上到根目录
const backupDir = path.join(__dirname, 'backups');

// 确保备份目录存在
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 生成带时间戳的文件名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = path.join(backupDir, `data-${timestamp}.db`);

try {
  fs.copyFileSync(source, dest);
  console.log(`✅ 备份成功: ${dest}`);
} catch (err) {
  console.error('❌ 备份失败:', err.message);
}