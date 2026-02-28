<template>
  <div id="app">
    <h1>My-Yui 知识库</h1>
    <div class="container">
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

      <div class="main">
        <NotesList
          :filter-category-id="selectedCategory?.id || null"
          @view="handleViewNote"
          @edit="handleEditNote"
          @create="handleCreateNote"
          @delete="handleDeleteNote"
        />
      </div>

      <div class="sidebar-right">
        <TagManager />
      </div>

      <NoteForm
        :visible="showNoteForm"
        :note="editingNote"
        @close="showNoteForm = false"
        @saved="handleNoteSaved"
      />

      <NoteView
        :visible="showNoteView"
        :note="viewingNote"
        @close="showNoteView = false"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from './stores/categories'
import { useNotesStore } from './stores/notes'
import CategoryTree from './components/CategoryTree.vue'
import TagManager from './components/TagManager.vue'
import NotesList from './components/NotesList.vue'
import NoteForm from './components/NoteForm.vue'
import NoteView from './components/NoteView.vue'

const categoryStore = useCategoriesStore()
const notesStore = useNotesStore()

const selectedCategory = ref(null)
const showNoteForm = ref(false)
const editingNote = ref(null)
const showNoteView = ref(false)
const viewingNote = ref(null)

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
  console.log('笔记已删除', note)
}

const handleNoteSaved = () => {
  // 保存后无需额外操作，列表会自动刷新
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<style>
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