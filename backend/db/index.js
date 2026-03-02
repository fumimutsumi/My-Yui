/**
 * backend/db/index.js
 * 数据库核心模块：连接 SQLite，初始化表结构、索引、触发器和全文搜索虚拟表
 */
const Database = require('better-sqlite3');   // SQLite 驱动
const path = require('path');                  // 路径处理

// ========== 数据库连接 ==========
const dbPath = path.join(__dirname, '../../data.db'); // 数据库文件位于项目根目录
const db = new Database(dbPath);

// 启用外键约束（保证数据完整性）
db.pragma('foreign_keys = ON');
// 启用 WAL 模式（提高并发读写性能）
db.pragma('journal_mode = WAL');

// ========== 创建基础表 ==========
const initSQL = `
-- 分类表（树状结构）
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '/',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_path ON categories(path);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- 笔记-分类关联表（多对多）
CREATE TABLE IF NOT EXISTS note_categories (
    note_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, category_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_note_categories_category_id ON note_categories(category_id);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 笔记-标签关联表（多对多）
CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);
`;

db.exec(initSQL);
console.log('✅ 基础表创建/验证完成');

// ========== 全文搜索虚拟表（FTS5） ==========
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title,
    content,
    content=notes,
    tokenize = 'unicode61'   -- 支持中文、日文、特殊符号
  );
`);
console.log('✅ FTS5 虚拟表创建/验证完成');

// ========== 触发器：保持 notes 与 notes_fts 同步 ==========
db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END;
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
  END;
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END;
`);
console.log('✅ FTS 触发器创建/验证完成');

// ========== 重建 FTS 索引（确保已有笔记可搜索） ==========
try {
  db.exec('DELETE FROM notes_fts;');          // 清空虚拟表（如果存在）
} catch (e) {
  // 如果表不存在则忽略（但上面已创建，一般不会走到这里）
}
// 将所有笔记插入 FTS 表
db.exec('INSERT INTO notes_fts(rowid, title, content) SELECT id, title, content FROM notes;');
const count = db.prepare('SELECT COUNT(*) as count FROM notes_fts').get().count;
console.log(`✅ FTS 索引重建完成，已同步 ${count} 条笔记`);

// ========== 导出数据库连接 ==========
module.exports = db;