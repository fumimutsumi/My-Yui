/**
 * Pinia Store - 分类管理
 */
import { defineStore } from 'pinia'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories'

export const useCategoriesStore = defineStore('categories', {
  // ========== 状态 ==========
  state: () => ({
    categories: [],      // 树形分类列表
    loading: false
  }),

  // ========== 动作 ==========
  actions: {
    // 获取所有分类
    async fetchCategories() {
      this.loading = true
      try {
        const res = await getCategories()
        // 根据后端返回结构，数据在 res.data 中
        this.categories = res.data
      } catch (error) {
        console.error('获取分类失败', error)
      } finally {
        this.loading = false
      }
    },

    // 添加分类
    async addCategory(categoryData) {
      await createCategory(categoryData)
      // 添加后重新获取列表，确保树状结构正确（也可以手动插入，但简单起见重新获取）
      await this.fetchCategories()
    },

    // 更新分类名称
    async updateCategory(id, name) {
      await updateCategory(id, { name })
      await this.fetchCategories()
    },

    // 删除分类
    async deleteCategory(id) {
      await deleteCategory(id)
      await this.fetchCategories()
    }
  }
})