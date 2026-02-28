<template>
  <ul>
    <li v-for="cat in categories" :key="cat.id">
      <div class="category-item">
        <span @click="toggle(cat)" class="expand-icon">
          {{ cat.children && cat.children.length ? (expanded[cat.id] ? '▼' : '▶') : '•' }}
        </span>
        <span class="category-name" @click="selectCategory(cat)">{{ cat.name }}</span>
        <button @click="startAddSub(cat)">+子</button>
        <button @click="startEdit(cat)">编辑</button>
        <button @click="confirmDelete(cat)">删除</button>
      </div>
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

const props = defineProps({
  categories: Array
})

const emit = defineEmits(['select', 'add-sub', 'edit', 'delete'])

// 控制节点展开/折叠
const expanded = ref({})

const toggle = (cat) => {
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