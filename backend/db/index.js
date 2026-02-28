const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

const initSQL = `
-- 分类表（已存在）
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

-- 笔记-分类关联表
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

-- 笔记-标签关联表
CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);

-- 全文搜索虚拟表（FTS5），可选，后续可以单独创建
-- 注意：FTS5 需要单独创建，且触发器需要后续添加，这里先注释
-- CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(title, content, content=notes);
`;

db.exec(initSQL);
// 全文搜索虚拟表（FTS5）
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title,
    content,
    content=notes,
    tokenize = 'unicode61'   -- 可选，用于英文词干分析，中文可移除
  );
`);

// 触发器：插入笔记时同步到 FTS 表
db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END;
`);

// 触发器：删除笔记时同步删除 FTS 记录
db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
  END;
`);

// 触发器：更新笔记时先删除旧记录再插入新记录
db.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END;
`);

// 重建 FTS 索引以确保所有现有笔记可搜索
try {
  // 清空 FTS 表（如果存在）
  db.exec('DELETE FROM notes_fts;');
} catch (e) {
  // 表可能不存在，忽略错误
  console.log('notes_fts 表不存在，跳过清空');
}
// 插入所有笔记
db.exec('INSERT INTO notes_fts(rowid, title, content) SELECT id, title, content FROM notes;');
const count = db.prepare('SELECT COUNT(*) as count FROM notes_fts').get().count;
console.log(`FTS 索引重建完成，已同步 ${count} 条笔记`);

module.exports = db;