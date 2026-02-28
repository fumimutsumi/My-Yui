const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/tags - 获取所有标签
router.get('/', (req, res) => {
  try {
    const tags = db.prepare('SELECT id, name FROM tags ORDER BY name').all();
    res.json({ code: 0, data: tags });
  } catch (err) {
    console.error('获取标签列表失败:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

// GET /api/tags/:id - 获取单个标签（可选，一般不需要）
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

// POST /api/tags - 创建标签
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ code: 400, message: '标签名称不能为空' });
  }

  try {
    // 尝试插入，如果名称重复会抛出错误
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

// PUT /api/tags/:id - 更新标签名称
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

// DELETE /api/tags/:id - 删除标签
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    // 由于外键级联，删除标签会自动删除 note_tags 中的关联记录
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