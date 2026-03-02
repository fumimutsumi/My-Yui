<template>
  <ul>
    <li v-for="cat in categories" :key="cat.id">
      <div class="category-item">
        <!-- 展开/折叠图标，只有有子节点的分类才显示箭头 -->
        <span @click="toggle(cat)" class="expand-icon">
          {{ cat.children && cat.children.length ? (expanded[cat.id] ? '▼' : '▶') : '•' }}
        </span>
        <!-- 分类名称，点击可选中 -->
        <span class="category-name" @click="selectCategory(cat)">{{ cat.name }}</span>
        <!-- 操作按钮 -->
        <button @click="startAddSub(cat)">+子</button>
        <button @click="startEdit(cat)">编辑</button>
        <button @click="confirmDelete(cat)">删除</button>
      </div>
      <!-- 递归渲染子分类，当节点展开且有 children 时 -->
      <CategoryTree
        v-if="expanded[cat.id] && cat.children"
        :categories="cat.children"
        @select="selectCategory"
        @add-sub="$emit('add-sub', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

// ========== Props 定义 ==========
// categories: 当前层级的分类数组（树形结构）
const props = defineProps({
  categories: Array
})

// ========== Emits 定义 ==========
// select: 选中分类时触发
// add-sub: 添加子分类时触发
// edit: 编辑分类时触发
// delete: 删除分类时触发
const emit = defineEmits(['select', 'add-sub', 'edit', 'delete'])

// ========== 响应式状态 ==========
// 记录每个节点的展开/折叠状态，key 为分类 id
const expanded = ref({})

// ========== 方法 ==========
const toggle = (cat) => {
  // 只有有子节点的分类才能切换展开状态
  if (cat.children && cat.children.length) {
    expanded.value[cat.id] = !expanded.value[cat.id]
  }
}

const selectCategory = (cat) => {
  emit('select', cat)
}

const startAddSub = (cat) => {
  emit('add-sub', cat)
}

const startEdit = (cat) => {
  emit('edit', cat)
}

const confirmDelete = (cat) => {
  if (confirm(`确定删除分类“${cat.name}”及其所有子分类吗？`)) {
    emit('delete', cat)
  }
}
</script>

<style scoped>
/* 组件私有样式 */
ul {
  list-style: none;
  padding-left: 20px;
}
.category-item {
  margin: 4px 0;
}
.expand-icon {
  display: inline-block;
  width: 20px;
  cursor: pointer;
}
.category-name {
  cursor: pointer;
  margin-right: 10px;
}
button {
  margin-right: 5px;
  font-size: 12px;
}
</style>