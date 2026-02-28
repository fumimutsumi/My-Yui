<template>
  <div class="modal-mask" v-if="visible" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑笔记' : '新建笔记' }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="form.title" required />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="form.content" rows="6" required></textarea>
          </div>
          <div class="form-group">
            <label>分类</label>
            <div class="checkbox-group">
              <div v-for="cat in categories" :key="cat.id" class="checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    :value="cat.id"
                    v-model="form.categoryIds"
                  />
                  {{ cat.name }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="checkbox-group">
              <div v-for="tag in tags" :key="tag.id" class="checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    :value="tag.id"
                    v-model="form.tagIds"
                  />
                  {{ tag.name }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="close">取消</button>
            <button type="submit" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import { useTagsStore } from '../stores/tags'
import { useNotesStore } from '../stores/notes'

const props = defineProps({
  visible: Boolean,
  note: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()
const notesStore = useNotesStore()

// 获取分类和标签数据（扁平化树？这里直接使用树结构，但选择框最好用扁平列表，方便展示）
// 为了简化，我们直接用 store 中的树形 categories，但选择时需要遍历所有节点
// 可以使用计算属性将树扁平化
const categories = computed(() => {
  const flatten = (cats) => {
    let result = []
    cats.forEach(cat => {
      result.push({ id: cat.id, name: cat.name })
      if (cat.children && cat.children.length) {
        result = result.concat(flatten(cat.children))
      }
    })
    return result
  }
  return flatten(categoriesStore.categories)
})

const tags = computed(() => tagsStore.tags)

const isEdit = computed(() => !!props.note)

// 表单数据
const form = reactive({
  title: '',
  content: '',
  categoryIds: [],
  tagIds: []
})

// 重置表单
const resetForm = () => {
  form.title = ''
  form.content = ''
  form.categoryIds = []
  form.tagIds = []
}

// 当传入的 note 变化时，填充表单
watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      form.title = newNote.title || ''
      form.content = newNote.content || ''
      form.categoryIds = newNote.categories ? newNote.categories.map(c => c.id) : []
      form.tagIds = newNote.tags ? newNote.tags.map(t => t.id) : []
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 当 visible 变为 false 时，重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  }
)

const saving = ref(false)

const handleSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await notesStore.updateNote(props.note.id, form)
    } else {
      await notesStore.addNote(form)
    }
    emit('saved')
    close()
  } catch (error) {
    console.error('保存笔记失败', error)
    alert('保存失败，请查看控制台')
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.modal-body {
  padding: 20px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}
.form-group textarea {
  resize: vertical;
}
.checkbox-group {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.checkbox-item {
  flex: 0 0 auto;
  min-width: 120px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.form-actions button[type="submit"] {
  background-color: #42b983;
  color: white;
}
.form-actions button[type="submit"]:hover {
  background-color: #3aa876;
}
.form-actions button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>