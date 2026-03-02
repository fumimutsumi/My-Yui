/**
 * backend/routes/categories.js
 * 处理与分类相关的所有 API 请求
 * 数据库表：categories
 * 关键点：使用 path 字段存储路径（如 "1/3/5/"）便于快速查询子树
 */
const express = require('express');
const router = express.Router();
const db = require('../db');   // 导入数据库连接

// ========== 获取所有分类（树状结构） ==========
// GET /api/categories
router.get('/', (req, res) => {
  try {
    // 按 path 排序可保证父分类在前，方便构建树
    const rows = db.prepare('SELECT id, parent_id, name, path FROM categories ORDER BY path').all();

    // 构建 id 到分类对象的映射，每个对象预留 children 数组
    const map = {};
    rows.forEach(row => {
      map[row.id] = { ...row, children: [] };
    });

    // 根据 parent_id 将子分类挂到父分类的 children 中
    const roots = [];
    rows.forEach(row => {
      if (row.parent_id === null) {
        roots.push(map[row.id]);               // 根分类直接加入 roots
      } else {
        if (map[row.parent_id]) {
          map[row.parent_id].children.push(map[row.id]);
        }
      }
    });

    res.json({ code: 0, data: roots });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 创建分类 ==========
// POST /api/categories
// 请求体格式：{ name, parentId }   parentId 可选，若省略则为根分类
router.post('/', (req, res) => {
  const { name, parentId } = req.body;
  if (!name) {
    return res.status(400).json({ code: 400, message: '分类名称不能为空' });
  }

  try {
    let parentPath = '';
    if (parentId) {
      // 查询父分类的 path
      const parent = db.prepare('SELECT path FROM categories WHERE id = ?').get(parentId);
      if (!parent) {
        return res.status(404).json({ code: 404, message: '父分类不存在' });
      }
      parentPath = parent.path;
    }

    // 插入新分类（暂时 path 留空）
    const insert = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
    const info = insert.run(name, parentId || null);
    const newId = info.lastInsertRowid;

    // 构造完整路径：父路径 + 自身id + '/'
    const fullPath = parentPath + newId + '/';
    db.prepare('UPDATE categories SET path = ? WHERE id = ?').run(fullPath, newId);

    // 返回刚创建的分类
    const newCategory = db.prepare('SELECT id, parent_id, name, path FROM categories WHERE id = ?').get(newId);
    res.status(201).json({ code: 0, data: newCategory });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 修改分类名称 ==========
// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ code: 400, message: '分类名称不能为空' });
  }

  try {
    const result = db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    const updated = db.prepare('SELECT id, parent_id, name, path FROM categories WHERE id = ?').get(id);
    res.json({ code: 0, data: updated });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ========== 删除分类 ==========
// DELETE /api/categories/:id
// 由于外键设置了 ON DELETE CASCADE，删除父分类会自动删除所有子分类和关联表中的记录
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;