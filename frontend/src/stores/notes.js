import { defineStore } from 'pinia'
import { getNotes, createNote, updateNote, deleteNote, getNote, searchNotes } from '@/api/notes'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    total: 0,
    currentPage: 1,
    limit: 20,
    loading: false,
    filters: { categoryId: null, tagId: null },
    currentNote: null,
    searchMode: false,
    searchKeyword: ''
  }),
  actions: {
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
    async fetchNote(id) {
      try {
        const res = await getNote(id)
        this.currentNote = res.data
        return res.data
      } catch (error) {
        console.error('获取笔记详情失败', error)
      }
    },
    async addNote(note) {
      await createNote(note)
      if (this.searchMode) {
        await this.searchNotes(this.searchKeyword)
      } else {
        await this.fetchNotes()
      }
    },
    async updateNote(id, note) {
      await updateNote(id, note)
      if (this.searchMode) {
        await this.searchNotes(this.searchKeyword)
      } else {
        await this.fetchNotes()
      }
    },
    async deleteNote(id) {
      await deleteNote(id)
      if (this.searchMode) {
        await this.searchNotes(this.searchKeyword)
      } else {
        await this.fetchNotes()
      }
    },
    setFilter(filter) {
      this.filters = { ...this.filters, ...filter }
      this.currentPage = 1
      this.fetchNotes()
    },
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
    clearSearch() {
      this.searchMode = false
      this.searchKeyword = ''
      this.currentPage = 1
      this.fetchNotes()
    }
  }
})