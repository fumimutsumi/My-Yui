/**
 * 分类相关 API 请求模块
 */
import request from './request'

// 获取所有分类（树状）
export const getCategories = () => request.get('/categories')

// 创建分类
// data 格式: { name, parentId }
export const createCategory = (data) => request.post('/categories', data)

// 更新分类名称
export const updateCategory = (id, data) => request.put(`/categories/${id}`, data)

// 删除分类
export const deleteCategory = (id) => request.delete(`/categories/${id}`)