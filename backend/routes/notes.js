/**
 * backend/routes/notes.js
 * 处理与笔记相关的所有 API 请求
 * 包括增删改查、分页、筛选、全文搜索
 * 表结构：notes, note_categories, note_tags, notes_fts
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// ========== 辅助函数：获取单条笔记的完整信息（包含分类和标签） ==========
function getNoteDetail(id) {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  if (!note) return null;

  // 查询关联的分类
  const categories = db.prepare(`
    SELECT c.id, c.name
    FROM categories c
    JOIN note_categories nc ON c.id = nc.category_id
    WHERE nc.note_id = ?
  `).all(id);

  // 查询关联的标签
  const tags = db.prepare(`
    SELECT t.id, t.name
    FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `).all(id);

  return { ...note, categories, tags };
}

// ========== 获取笔记列表（分页 + 筛选） ==========
// GET /api/notes?page=1&limit=20&category_id=1&tag_id=2
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const categoryId = req.query.category_id;
  const tagId = req.query.tag_id;
  const offset = (page - 1) * limit;

  try {
    // 动态构建查询语句（根据是否有 categoryId/tagId 决定是否 JOIN）
    let baseQuery = `SELECT DISTINCT n.id, n.title, n.created_at, n.updated_at FROM notes n`;
    let countQuery = `SELECT COUNT(DISTINCT n.id) as total FROM notes n`;
    const joins = [];
    const whereClauses = [];
    const params = [];

    if (categoryId) {
      joins.push('JOIN note_categories nc ON n.id = nc.note_id');
      whereClauses.push('nc.category_id = ?');
      params.push(categoryId);
    }
    if (tagId) {
      joins.push('JOIN note_tags nt ON n.id = nt.note_id');
      whereClauses.push('nt.tag_id = ?');
      params.push(tagId);
    }

    const joinStr = joins.join(' ');
    const whereStr = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // 获取总条数（用于前端分页）
    const totalRow = db.prepare(`${countQuery} ${joinStr} ${whereStr}`).get(...params);
    const total = totalRow.total;

    // 获取当前页笔记，并通过 LEFT JOIN 一次性把分类和标签也取出来（使用 GROUP_CONCAT 避免 N+1）
    const dataQuery = `
      SELECT n.id, n.title, n.created_at, n.updated_at,
             GROUP_CONCAT(DISTINCT c.id) as cat_ids,
             GROUP_CONCAT(DISTINCT c.name) as cat_names,
             GROUP_CONCAT(DISTINCT t.id) as tag_ids,
             GROUP_CONCAT(DISTINCT t.name) as tag_names
      FROM notes n
      LEFT JOIN note_categories nc ON n.id = nc.note_id
      LEFT JOIN categories c ON nc.category_id = c.id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      ${joinStr} ${whereStr}
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];
    const rows = db.prepare(dataQuery).all(...dataParams);

    // 将 cat_ids/cat_names/tag_ids/tag_names 解析为数组格式
    const notes = rows.map(row => ({
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      updated_at: row.updated_at,
      categories: row.cat_ids ? row.cat_ids.split(',').map((id, i) => ({
        id: Number(id),
        name: row.cat_names.split(',')[i]
      })) : [],
      tags: row.tag_ids ? row.tag_ids.split(',').map((id, i) => ({
        id: Number(id),
        name: row.tag_names.split(',')[i]
      })) : []
    }));

    res.json({ code: 0, data: notes, total, page, limit });
  } catch (err) {
    console.error('获取笔记列表失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 全文搜索笔记 ==========
// GET /api/notes/search?q=关键词&page=1&limit=20
// 注意：必须放在 /:id 之前，否则会被当作 :id 捕获
router.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.json({ code: 0, data: [], total: 0 });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    let total = 0;
    let rows = [];

    // 策略：短词（≤2）使用 LIKE 模糊匹配（FTS5 对短词支持不佳）
    if (q.length <= 2) {
      // 转义 SQL 通配符 % 和 _
      const likeQ = `%${q.replace(/[%_]/g, '\\$&')}%`;
      // 统计总数
      const countStmt = db.prepare(`
        SELECT COUNT(*) as total
        FROM notes
        WHERE title LIKE ? OR content LIKE ?
      `);
      total = countStmt.get(likeQ, likeQ).total;

      // 查询数据
      const dataStmt = db.prepare(`
        SELECT id, title, content, created_at, updated_at
        FROM notes
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);
      rows = dataStmt.all(likeQ, likeQ, limit, offset);
    } else {
      // 长词使用 FTS5 全文搜索
      const countStmt = db.prepare(`
        SELECT COUNT(*) as total
        FROM notes_fts
        WHERE notes_fts MATCH ?
      `);
      total = countStmt.get(q).total;

      const dataStmt = db.prepare(`
        SELECT n.id, n.title, n.content, n.created_at, n.updated_at,
               snippet(notes_fts, 1, '<b>', '</b>', '...', 10) as highlight
        FROM notes n
        JOIN notes_fts ON n.id = notes_fts.rowid
        WHERE notes_fts MATCH ?
        ORDER BY rank
        LIMIT ? OFFSET ?
      `);
      rows = dataStmt.all(q, limit, offset);
    }

    // 为每条搜索结果补充其分类和标签信息
    const enrichedRows = rows.map(row => {
      const categories = db.prepare(`
        SELECT c.id, c.name
        FROM categories c
        JOIN note_categories nc ON c.id = nc.category_id
        WHERE nc.note_id = ?
      `).all(row.id);
      const tags = db.prepare(`
        SELECT t.id, t.name
        FROM tags t
        JOIN note_tags nt ON t.id = nt.tag_id
        WHERE nt.note_id = ?
      `).all(row.id);
      return { ...row, categories, tags };
    });

    res.json({ code: 0, data: enrichedRows, total, page, limit });
  } catch (err) {
    console.error('搜索失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 获取单条笔记详情 ==========
// GET /api/notes/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const note = getNoteDetail(id);
    if (!note) {
      return res.status(404).json({ code: 404, message: '笔记不存在' });
    }
    res.json({ code: 0, data: note });
  } catch (err) {
    console.error('获取笔记详情失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 创建笔记 ==========
// POST /api/notes
// 请求体格式：{ title, content, categoryIds, tagIds }
router.post('/', (req, res) => {
  const { title, content, categoryIds, tagIds } = req.body;
  if (!title || !content) {
    return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
  }

  try {
    // 预编译 SQL 语句（提高效率）
    const insertNote = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
    const insertNoteCategory = db.prepare('INSERT INTO note_categories (note_id, category_id) VALUES (?, ?)');
    const insertNoteTag = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');

    // 使用事务保证原子性：要么全部成功，要么全部失败
    const transaction = db.transaction((title, content, categoryIds, tagIds) => {
      const info = insertNote.run(title, content);
      const noteId = info.lastInsertRowid;

      if (categoryIds && categoryIds.length) {
        for (const catId of categoryIds) {
          insertNoteCategory.run(noteId, catId);
        }
      }
      if (tagIds && tagIds.length) {
        for (const tagId of tagIds) {
          insertNoteTag.run(noteId, tagId);
        }
      }
      return noteId;
    });

    const noteId = transaction(title, content, categoryIds, tagIds);
    const newNote = getNoteDetail(noteId);
    res.status(201).json({ code: 0, data: newNote });
  } catch (err) {
    console.error('创建笔记失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 更新笔记 ==========
// PUT /api/notes/:id
// 请求体格式同上
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, categoryIds, tagIds } = req.body;

  if (!title || !content) {
    return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
  }

  try {
    // 检查笔记是否存在
    const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '笔记不存在' });
    }

    // 预编译语句
    const updateNote = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const deleteCategories = db.prepare('DELETE FROM note_categories WHERE note_id = ?');
    const deleteTags = db.prepare('DELETE FROM note_tags WHERE note_id = ?');
    const insertCategory = db.prepare('INSERT INTO note_categories (note_id, category_id) VALUES (?, ?)');
    const insertTag = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');

    // 事务：更新笔记基本信息 + 删除旧关联 + 插入新关联
    const transaction = db.transaction((id, title, content, categoryIds, tagIds) => {
      updateNote.run(title, content, id);
      deleteCategories.run(id);
      if (categoryIds && categoryIds.length) {
        for (const catId of categoryIds) {
          insertCategory.run(id, catId);
        }
      }
      deleteTags.run(id);
      if (tagIds && tagIds.length) {
        for (const tagId of tagIds) {
          insertTag.run(id, tagId);
        }
      }
    });

    transaction(id, title, content, categoryIds, tagIds);
    const updatedNote = getNoteDetail(id);
    res.json({ code: 0, data: updatedNote });
  } catch (err) {
    console.error('更新笔记失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 删除笔记 ==========
// DELETE /api/notes/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '笔记不存在' });
    }
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    console.error('删除笔记失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;