<template>
  <div class="search-bar">
    <!-- 搜索输入框，回车触发搜索 -->
    <input
      type="text"
      v-model="keyword"
      placeholder="搜索笔记..."
      @keyup.enter="search"
    />
    <!-- 搜索按钮，无关键词时禁用 -->
    <button 
      @click="search" 
      :disabled="!keyword.trim() || searching"
    >
      搜索
    </button>
    <!-- 清空按钮，只有有关键词时才显示 -->
    <button v-if="keyword" @click="clearSearch" class="clear">清空</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotesStore } from '../stores/notes'

// ========== Store 实例 ==========
const notesStore = useNotesStore()

// ========== 响应式状态 ==========
const keyword = ref('')       // 搜索关键词
const searching = ref(false)  // 搜索状态（防止重复点击）

// ========== 方法 ==========
const search = async () => {
  if (!keyword.value.trim()) return
  searching.value = true
  try {
    await notesStore.searchNotes(keyword.value)
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  keyword.value = ''
  notesStore.clearSearch()
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}
.search-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.search-bar button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.search-bar button:hover {
  background-color: #3aa876;
}
.search-bar button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.search-bar .clear {
  background-color: #f44336;
}
.search-bar .clear:hover {
  background-color: #d32f2f;
}
</style>