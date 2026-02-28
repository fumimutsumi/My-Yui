const express = require('express');
const router = express.Router();
const db = require('../db');

// 辅助函数：获取单条笔记的完整信息（包含分类和标签）
const getNoteDetail = (id) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  if (!note) return null;

  // 获取关联的分类
  const categories = db.prepare(`
    SELECT c.id, c.name
    FROM categories c
    JOIN note_categories nc ON c.id = nc.category_id
    WHERE nc.note_id = ?
  `).all(id);

  // 获取关联的标签
  const tags = db.prepare(`
    SELECT t.id, t.name
    FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `).all(id);

  return {
    ...note,
    categories,
    tags
  };
};

// GET /api/notes - 分页获取笔记列表（支持按分类、标签过滤）
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const categoryId = req.query.category_id;
  const tagId = req.query.tag_id;
  const offset = (page - 1) * limit;

  try {
    // 构建动态查询
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

    // 获取总数
    const totalRow = db.prepare(`${countQuery} ${joinStr} ${whereStr}`).get(...params);
    const total = totalRow.total;

    // 获取分页数据，并一次性获取每个笔记的分类和标签（使用 GROUP_CONCAT 避免 N+1）
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

    // 组装返回数据
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

    res.json({
      code: 0,
      data: notes,
      total,
      page,
      limit
    });
  } catch (err) {
    console.error('获取笔记列表失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// GET /api/notes/search?q=关键词&page=1&limit=20
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

    // 判断关键词长度：如果 ≤2，使用 LIKE 查询（支持任意位置匹配）
    if (q.length <= 2) {
      // 使用 LIKE 查询（转义 % 和 _）
      const likeQ = `%${q.replace(/[%_]/g, '\\$&')}%`; // 简单转义
      const countStmt = db.prepare(`
        SELECT COUNT(*) as total
        FROM notes
        WHERE title LIKE ? OR content LIKE ?
      `);
      total = countStmt.get(likeQ, likeQ).total;

      const dataStmt = db.prepare(`
        SELECT id, title, content, created_at, updated_at
        FROM notes
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);
      rows = dataStmt.all(likeQ, likeQ, limit, offset);
    } else {
      // 使用 FTS5 全文搜索
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

    // 为每条结果补充分类和标签信息
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
      return {
        ...row,
        categories,
        tags
      };
    });

    res.json({
      code: 0,
      data: enrichedRows,
      total,
      page,
      limit
    });
  } catch (err) {
    console.error('搜索失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// GET /api/notes/:id - 获取单条笔记详情
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

// POST /api/notes - 创建笔记
router.post('/', (req, res) => {
  const { title, content, categoryIds, tagIds } = req.body;
  if (!title || !content) {
    return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
  }

  try {
    const insertNote = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
    const insertNoteCategory = db.prepare('INSERT INTO note_categories (note_id, category_id) VALUES (?, ?)');
    const insertNoteTag = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');

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

// PUT /api/notes/:id - 更新笔记
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, categoryIds, tagIds } = req.body;

  if (!title || !content) {
    return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
  }

  try {
    // 先检查笔记是否存在
    const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '笔记不存在' });
    }

    const updateNote = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const deleteCategories = db.prepare('DELETE FROM note_categories WHERE note_id = ?');
    const deleteTags = db.prepare('DELETE FROM note_tags WHERE note_id = ?');
    const insertCategory = db.prepare('INSERT INTO note_categories (note_id, category_id) VALUES (?, ?)');
    const insertTag = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');

    const transaction = db.transaction((id, title, content, categoryIds, tagIds) => {
      // 更新笔记基本信息
      updateNote.run(title, content, id);

      // 更新分类关联
      deleteCategories.run(id);
      if (categoryIds && categoryIds.length) {
        for (const catId of categoryIds) {
          insertCategory.run(id, catId);
        }
      }

      // 更新标签关联
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

// DELETE /api/notes/:id - 删除笔记
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