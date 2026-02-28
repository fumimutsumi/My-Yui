import request from './request'

// 获取所有分类（树状）
export const getCategories = () => request.get('/categories')

// 创建分类
export const createCategory = (data) => request.post('/categories', data)

// 更新分类
export const updateCategory = (id, data) => request.put(`/categories/${id}`, data)

// 删除分类
export const deleteCategory = (id) => request.delete(`/categories/${id}`)