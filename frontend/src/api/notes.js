/**
 * 笔记相关 API 请求模块
 */
import request from './request'

// 获取笔记列表（支持分页、筛选）
export const getNotes = (params) => request.get('/notes', { params })

// 获取单条笔记详情
export const getNote = (id) => request.get(`/notes/${id}`)

// 创建笔记
export const createNote = (data) => request.post('/notes', data)

// 更新笔记
export const updateNote = (id, data) => request.put(`/notes/${id}`, data)

// 删除笔记
export const deleteNote = (id) => request.delete(`/notes/${id}`)

// 搜索笔记
export const searchNotes = (params) => request.get('/notes/search', { params })