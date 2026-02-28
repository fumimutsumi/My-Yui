import request from './request'

export const getNotes = (params) => request.get('/notes', { params })
export const getNote = (id) => request.get(`/notes/${id}`)
export const createNote = (data) => request.post('/notes', data)
export const updateNote = (id, data) => request.put(`/notes/${id}`, data)
export const deleteNote = (id) => request.delete(`/notes/${id}`)
export const searchNotes = (params) => request.get('/notes/search', { params })