<template>
  <div id="app">
    <h1>My-Yui 知识库</h1>
    <div class="container">
      <!-- 左侧分类管理区 -->
      <div class="sidebar">
        <h2>分类管理</h2>
        <button @click="startAddRoot">+ 添加根分类</button>
        <CategoryTree
          :categories="categoryStore.categories"
          @select="handleSelect"
          @add-sub="handleAddSub"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- 中间笔记列表区 -->
      <div class="main">
        <NotesList
          :filter-category-id="selectedCategory?.id || null"
          @view="handleViewNote"
          @edit="handleEditNote"
          @create="handleCreateNote"
          @delete="handleDeleteNote"
        />
      </div>

      <!-- 右侧标签管理区 -->
      <div class="sidebar-right">
        <TagManager />
      </div>

      <!-- 笔记编辑/新建模态框 -->
      <NoteForm
        :visible="showNoteForm"
        :note="editingNote"
        @close="showNoteForm = false"
        @saved="handleNoteSaved"
      />

      <!-- 笔记查看模态框 -->
      <NoteView
        :visible="showNoteView"
        :note="viewingNote"
        @close="showNoteView = false"
      />
    </div>
  </div>
</template>

<script setup>
// ========== 导入依赖 ==========
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from './stores/categories'
import { useNotesStore } from './stores/notes'
import CategoryTree from './components/CategoryTree.vue'
import TagManager from './components/TagManager.vue'
import NotesList from './components/NotesList.vue'
import NoteForm from './components/NoteForm.vue'
import NoteView from './components/NoteView.vue'

// ========== 状态管理 Store 实例 ==========
const categoryStore = useCategoriesStore()
const notesStore = useNotesStore()

// ========== 响应式状态 ==========
const selectedCategory = ref(null)           // 当前选中的分类
const showNoteForm = ref(false)              // 是否显示笔记编辑模态框
const editingNote = ref(null)                 // 正在编辑的笔记对象
const showNoteView = ref(false)               // 是否显示笔记查看模态框
const viewingNote = ref(null)                  // 正在查看的笔记对象

// ========== 分类操作事件处理 ==========
const handleSelect = (cat) => {
  selectedCategory.value = cat
}

const startAddRoot = () => {
  const name = prompt('输入新根分类名称：')
  if (name) {
    categoryStore.addCategory({ name, parentId: null })
  }
}

const handleAddSub = (parentCat) => {
  const name = prompt(`为“${parentCat.name}”添加子分类名称：`)
  if (name) {
    categoryStore.addCategory({ name, parentId: parentCat.id })
  }
}

const handleEdit = (cat) => {
  const newName = prompt('修改分类名称：', cat.name)
  if (newName && newName !== cat.name) {
    categoryStore.updateCategory(cat.id, newName)
  }
}

const handleDelete = (cat) => {
  categoryStore.deleteCategory(cat.id)
}

// ========== 笔记操作事件处理 ==========
const handleViewNote = async (note) => {
  const fullNote = await notesStore.fetchNote(note.id)
  if (fullNote) {
    viewingNote.value = fullNote
    showNoteView.value = true
  } else {
    alert('获取笔记详情失败')
  }
}

const handleEditNote = async (note) => {
  const fullNote = await notesStore.fetchNote(note.id)
  if (fullNote) {
    editingNote.value = fullNote
    showNoteForm.value = true
  } else {
    alert('获取笔记详情失败')
  }
}

const handleCreateNote = () => {
  editingNote.value = null
  showNoteForm.value = true
}

const handleDeleteNote = (note) => {
  // 删除操作已在 NotesList 中处理，这里仅用于日志
  console.log('笔记已删除', note)
}

const handleNoteSaved = () => {
  // 保存后无需额外操作，列表会自动刷新
}

// ========== 生命周期钩子 ==========
onMounted(() => {
  categoryStore.fetchCategories()  // 初始化时加载分类树
})
</script>

<style>
/* 全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}
.container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.sidebar {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
  padding-right: 20px;
}
.sidebar-right {
  width: 250px;
  flex-shrink: 0;
  border-left: 1px solid #eee;
  padding-left: 20px;
}
.main {
  flex: 1;
  min-width: 0;
}
</style>