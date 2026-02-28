<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="keyword"
      placeholder="搜索笔记..."
      @keyup.enter="search"
    />
    <button 
      @click="search" 
      :disabled="!keyword.trim() || searching"
    >
      搜索
    </button>
    <button v-if="keyword" @click="clearSearch" class="clear">清空</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotesStore } from '../stores/notes'

const notesStore = useNotesStore()
const keyword = ref('')
const searching = ref(false)

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