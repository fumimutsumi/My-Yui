<template>
  <div class="notes-list">
    <div class="header">
      <h3>笔记列表</h3>
      <button @click="createNew">+ 新建笔记</button>
    </div>

    <!-- 搜索栏组件 -->
    <SearchBar />

    <!-- 列表内容 -->
    <div v-if="loading">加载中...</div>
    <div v-else-if="notes.length === 0" class="empty">暂无笔记，点击新建</div>
    <ul v-else class="note-items">
      <li v-for="note in notes" :key="note.id" class="note-item" @click="viewNote(note)">
        <div class="note-title">{{ note.title }}</div>
        <div class="note-excerpt">{{ getExcerpt(note.content) }}</div>
        <div class="note-meta">
          <span>{{ formatDate(note.created_at) }}</span>
          <span v-if="note.categories.length" class="categories">
            分类: {{ note.categories.map(c => c.name).join(', ') }}
          </span>
        </div>
        <div class="note-tags" v-if="note.tags.length">
          <span v-for="tag in note.tags" :key="tag.id" class="tag-badge">
            {{ tag.name }}
          </span>
        </div>
        <!-- 操作按钮，阻止点击冒泡以免触发整行点击 -->
        <div class="actions" @click.stop>
          <button @click="editNote(note)">编辑</button>
          <button @click="deleteNote(note)">删除</button>
        </div>
      </li>
    </ul>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useNotesStore } from '../stores/notes'
import SearchBar from './SearchBar.vue'

// ========== Props 定义 ==========
// 从父组件传入的筛选条件
const props = defineProps({
  filterCategoryId: { type: Number, default: null },
  filterTagId: { type: Number, default: null }
})

// ========== Emits 定义 ==========
const emit = defineEmits(['view', 'edit', 'create', 'delete'])

// ========== Store 实例 ==========
const notesStore = useNotesStore()

// ========== 计算属性 ==========
const notes = computed(() => notesStore.notes)
const total = computed(() => notesStore.total)
const currentPage = computed(() => notesStore.currentPage)
const limit = computed(() => notesStore.limit)
const loading = computed(() => notesStore.loading)
const searchMode = computed(() => notesStore.searchMode)

const totalPages = computed(() => Math.ceil(total.value / limit.value))

// ========== 监听筛选条件变化 ==========
// 当 filterCategoryId 或 filterTagId 变化时，更新 store 中的筛选条件并重新获取笔记
watch(
  [() => props.filterCategoryId, () => props.filterTagId],
  () => {
    if (!searchMode.value) {
      notesStore.filters.categoryId = props.filterCategoryId
      notesStore.filters.tagId = props.filterTagId
      notesStore.fetchNotes()
    }
  },
  { immediate: true }
)

// ========== 生命周期钩子 ==========
onMounted(() => {
  if (!searchMode.value) {
    notesStore.fetchNotes()
  }
})

// ========== 方法 ==========
const changePage = (page) => {
  notesStore.currentPage = page
  if (searchMode.value) {
    notesStore.searchNotes(notesStore.searchKeyword)
  } else {
    notesStore.fetchNotes()
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

const viewNote = (note) => {
  emit('view', note)
}

const editNote = (note) => {
  emit('edit', note)
}

const deleteNote = (note) => {
  if (confirm(`确定删除笔记“${note.title}”吗？`)) {
    notesStore.deleteNote(note.id)
  }
}

const createNew = () => {
  emit('create')
}

const getExcerpt = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.slice(0, 100) + '...' : content
}
</script>

<style scoped>
.notes-list { border: 1px solid #eee; padding: 15px; border-radius: 5px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.note-items { list-style: none; padding: 0; margin: 0; }
.note-item { border-bottom: 1px solid #f0f0f0; padding: 12px 0; cursor: pointer; }
.note-item:hover { background-color: #fafafa; }
.note-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
.note-meta { font-size: 12px; color: #888; display: flex; gap: 15px; }
.actions { margin-top: 8px; display: flex; gap: 8px; }
.actions button { padding: 4px 8px; font-size: 12px; }
.pagination { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 15px; }
.empty { text-align: center; color: #999; padding: 30px; }
.note-excerpt { color: #666; font-size: 13px; margin: 5px 0; line-height: 1.4; }
.note-tags { margin: 8px 0; display: flex; flex-wrap: wrap; gap: 5px; }
.tag-badge { background-color: #e9e9e9; border-radius: 12px; padding: 2px 10px; font-size: 12px; }
</style>