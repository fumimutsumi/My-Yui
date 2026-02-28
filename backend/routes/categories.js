const express = require('express');
const router = express.Router();
const db = require('../db');  // 引入数据库连接

// 获取所有分类（树状结构）
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, parent_id, name, path FROM categories ORDER BY path').all();

    // 构建树结构
    const map = {};
    const roots = [];
    rows.forEach(row => {
      map[row.id] = { ...row, children: [] };
    });
    rows.forEach(row => {
      if (row.parent_id === null) {
        roots.push(map[row.id]);
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

// 创建分类
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

    // 插入新分类
    const insert = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
    const info = insert.run(name, parentId || null);
    const newId = info.lastInsertRowid;

    // 构造 path：父路径 + 新id + '/'
    const path = parentPath + newId + '/';
    db.prepare('UPDATE categories SET path = ? WHERE id = ?').run(path, newId);

    // 返回新创建的分类
    const newCategory = db.prepare('SELECT id, parent_id, name, path FROM categories WHERE id = ?').get(newId);
    res.status(201).json({ code: 0, data: newCategory });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 更新分类名称
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

// 删除分类
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    // 由于设置了外键 ON DELETE CASCADE，删除父分类会自动删除子分类，但需要确保 categories 表自身的外键级联
    // 但我们设计时 categories 表的外键是 ON DELETE CASCADE，所以直接删除即可
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