<template>
  <div class="tag-manager">
    <div class="header">
      <h3>标签管理</h3>
      <button @click="startAdd">+ 新建标签</button>
    </div>
    <ul class="tag-list" v-if="!loading">
      <li v-for="tag in tags" :key="tag.id" class="tag-item">
        <span class="tag-name">{{ tag.name }}</span>
        <button @click="startEdit(tag)">编辑</button>
        <button @click="confirmDelete(tag)">删除</button>
      </li>
      <li v-if="tags.length === 0" class="empty">暂无标签，点击上方按钮添加</li>
    </ul>
    <div v-else>加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTagsStore } from '../stores/tags'

const tagsStore = useTagsStore()
const tags = ref([])
const loading = ref(false)  // 添加 loading 状态

onMounted(async () => {
  loading.value = true
  await tagsStore.fetchTags()
  tags.value = tagsStore.tags
  loading.value = false
})

const startAdd = async () => {
  const name = prompt('输入新标签名称：')
  if (name) {
    loading.value = true
    await tagsStore.addTag(name)
    tags.value = tagsStore.tags
    loading.value = false
  }
}

const startEdit = async (tag) => {
  const newName = prompt('修改标签名称：', tag.name)
  if (newName && newName !== tag.name) {
    loading.value = true
    await tagsStore.updateTag(tag.id, newName)
    tags.value = tagsStore.tags
    loading.value = false
  }
}

const confirmDelete = async (tag) => {
  if (confirm(`确定删除标签“${tag.name}”吗？`)) {
    loading.value = true
    await tagsStore.deleteTag(tag.id)
    tags.value = tagsStore.tags
    loading.value = false
  }
}
</script>

<style scoped>
.tag-manager { padding: 10px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header h3 { margin: 0; }
.tag-list { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin: 0; }
.tag-item { background-color: #e9e9e9; border-radius: 20px; padding: 5px 12px; display: inline-flex; align-items: center; font-size: 14px; }
.tag-name { margin-right: 8px; }
.tag-item button { margin-left: 4px; padding: 2px 6px; font-size: 12px; border: none; background-color: transparent; color: #666; cursor: pointer; border-radius: 4px; }
.tag-item button:hover { background-color: #d0d0d0; }
.empty { width: 100%; text-align: center; color: #999; padding: 20px; }
</style>