import { defineStore } from 'pinia'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],      // 树形分类列表
    loading: false
  }),
  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const res = await getCategories()
        // 假设返回格式为 { code: 0, data: [...] }，拦截器已经返回了 res.data，所以 res 就是 { code, data }?
        // 我们上面拦截器直接返回 response.data，所以 res 就是后端返回的整个对象，包含 code 和 data
        // 所以这里需要 res.data
        this.categories = res.data
      } catch (error) {
        console.error('获取分类失败', error)
      } finally {
        this.loading = false
      }
    },
    async addCategory(categoryData) {
      const res = await createCategory(categoryData)
      // 重新获取列表（或者手动 push 新节点，但为了简单，重新 fetch）
      await this.fetchCategories()
      return res
    },
    async updateCategory(id, name) {
      const res = await updateCategory(id, { name })
      await this.fetchCategories()
      return res
    },
    async deleteCategory(id) {
      await deleteCategory(id)
      await this.fetchCategories()
    }
  }
})