/**
 * Pinia Store - 标签管理
 */
import { defineStore } from 'pinia'
import { getTags, createTag, updateTag, deleteTag } from '@/api/tags'

export const useTagsStore = defineStore('tags', {
  // ========== 状态 ==========
  state: () => ({
    tags: [],      // 标签列表
    loading: false
  }),

  // ========== 动作 ==========
  actions: {
    // 获取所有标签
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

    // 添加标签
    async addTag(name) {
      await createTag({ name })
      await this.fetchTags()
    },

    // 更新标签
    async updateTag(id, name) {
      await updateTag(id, { name })
      await this.fetchTags()
    },

    // 删除标签
    async deleteTag(id) {
      await deleteTag(id)
      await this.fetchTags()
    }
  }
})