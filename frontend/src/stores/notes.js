/**
 * Pinia Store - 笔记管理
 */
import { defineStore } from 'pinia'
import { getNotes, createNote, updateNote, deleteNote, getNote, searchNotes } from '@/api/notes'

export const useNotesStore = defineStore('notes', {
  // ========== 状态 ==========
  state: () => ({
    notes: [],                // 当前页笔记列表
    total: 0,                 // 总记录数
    currentPage: 1,           // 当前页码
    limit: 20,                // 每页条数
    loading: false,           // 加载状态
    filters: { categoryId: null, tagId: null }, // 当前筛选条件
    currentNote: null,        // 当前查看/编辑的笔记详情
    searchMode: false,        // 是否处于搜索模式
    searchKeyword: ''         // 搜索关键词
  }),

  // ========== 动作 ==========
  actions: {
    // 获取笔记列表（普通模式）
    async fetchNotes() {
      this.searchMode = false
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.limit,
          category_id: this.filters.categoryId,
          tag_id: this.filters.tagId
        }
        const res = await getNotes(params)
        this.notes = res.data
        this.total = res.total
      } catch (error) {
        console.error('获取笔记列表失败', error)
      } finally {
        this.loading = false
      }
    },

    // 获取单条笔记详情
    async fetchNote(id) {
      try {
        const res = await getNote(id)
        this.currentNote = res.data
        return res.data
      } catch (error) {
        console.error('获取笔记详情失败', error)
      }
    },

    // 添加笔记
    async addNote(note) {
      await createNote(note)
      // 添加后根据当前模式刷新列表
      if (this.searchMode) {
        await this.searchNotes(this.searchKeyword)
      } else {
        await this.fetchNotes()
      }
    },

    // 更新笔记
    async updateNote(id, note) {
      await updateNote(id, note)
      if (this.searchMode) {
        await this.searchNotes(this.searchKeyword)
      } else {
        await this.fetchNotes()
      }
    },

    // 删除笔记
    async deleteNote(id) {
      await deleteNote(id)
      if (this.searchMode) {
        await this.searchNotes(this.searchKeyword)
      } else {
        await this.fetchNotes()
      }
    },

    // 设置筛选条件（并自动获取）
    setFilter(filter) {
      this.filters = { ...this.filters, ...filter }
      this.currentPage = 1
      this.fetchNotes()
    },

    // 搜索笔记
    async searchNotes(keyword) {
      this.loading = true
      this.searchMode = true
      this.searchKeyword = keyword
      try {
        const params = {
          q: keyword,
          page: this.currentPage,
          limit: this.limit
        }
        const res = await searchNotes(params)
        this.notes = res.data
        this.total = res.total
      } catch (error) {
        console.error('搜索失败', error)
      } finally {
        this.loading = false
      }
    },

    // 清除搜索，返回普通列表
    clearSearch() {
      this.searchMode = false
      this.searchKeyword = ''
      this.currentPage = 1
      this.fetchNotes()
    }
  }
})