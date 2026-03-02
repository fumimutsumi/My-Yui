/**
 * 标签相关 API 请求模块
 */
import request from './request'

// 获取所有标签
export const getTags = () => request.get('/tags')

// 创建标签
export const createTag = (data) => request.post('/tags', data)

// 更新标签名称
export const updateTag = (id, data) => request.put(`/tags/${id}`, data)

// 删除标签
export const deleteTag = (id) => request.delete(`/tags/${id}`)