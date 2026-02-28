import { defineStore } from 'pinia'
import { getTags, createTag, updateTag, deleteTag } from '@/api/tags'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [],
    loading: false
  }),
  actions: {
    async fetchTags() {
      this.loading = true
      try {
        const res = await getTags()
        this.tags = res.data
      } catch (error) {
        console.error('获取标签失败', error)
      } finally {
        this.loading = false
      }
    },
    async addTag(name) {
      await createTag({ name })
      await this.fetchTags()
    },
    async updateTag(id, name) {
      await updateTag(id, { name })
      await this.fetchTags()
    },
    async deleteTag(id) {
      await deleteTag(id)
      await this.fetchTags()
    }
  }
})