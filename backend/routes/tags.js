/**
 * backend/routes/tags.js
 * 处理与标签相关的所有 API 请求
 * 表结构：tags（name 字段唯一）
 * 关联表 note_tags 会在删除标签时自动级联删除（外键）
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// ========== 获取所有标签 ==========
// GET /api/tags
router.get('/', (req, res) => {
  try {
    const tags = db.prepare('SELECT id, name FROM tags ORDER BY name').all();
    res.json({ code: 0, data: tags });
  } catch (err) {
    console.error('获取标签列表失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 获取单个标签（可选） ==========
// GET /api/tags/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const tag = db.prepare('SELECT id, name FROM tags WHERE id = ?').get(id);
    if (!tag) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    res.json({ code: 0, data: tag });
  } catch (err) {
    console.error('获取标签失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 创建标签 ==========
// POST /api/tags
// 请求体：{ name }
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ code: 400, message: '标签名称不能为空' });
  }

  try {
    const insert = db.prepare('INSERT INTO tags (name) VALUES (?)');
    const info = insert.run(name);
    const newTag = { id: info.lastInsertRowid, name };
    res.status(201).json({ code: 0, data: newTag });
  } catch (err) {
    // 处理唯一约束冲突
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ code: 409, message: '标签名称已存在' });
    }
    console.error('创建标签失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 更新标签名称 ==========
// PUT /api/tags/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ code: 400, message: '标签名称不能为空' });
  }

  try {
    const update = db.prepare('UPDATE tags SET name = ? WHERE id = ?');
    const result = update.run(name, id);
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    const updatedTag = { id: parseInt(id), name };
    res.json({ code: 0, data: updatedTag });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ code: 409, message: '标签名称已存在' });
    }
    console.error('更新标签失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 删除标签 ==========
// DELETE /api/tags/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    console.error('删除标签失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;