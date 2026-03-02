<template>
  <!-- 模态框背景，点击背景关闭 -->
  <div class="modal-mask" v-if="visible" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ note?.title || '笔记详情' }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body" v-if="note">
        <!-- 元信息 -->
        <div class="meta">
          <span>创建时间：{{ formatDate(note.created_at) }}</span>
          <span>更新时间：{{ formatDate(note.updated_at) }}</span>
        </div>
        <!-- 分类信息 -->
        <div class="categories" v-if="note.categories?.length">
          <strong>分类：</strong>
          <span v-for="(cat, idx) in note.categories" :key="cat.id">
            {{ cat.name }}{{ idx < note.categories.length - 1 ? '、' : '' }}
          </span>
        </div>
        <!-- 标签信息 -->
        <div class="tags" v-if="note.tags?.length">
          <strong>标签：</strong>
          <span v-for="(tag, idx) in note.tags" :key="tag.id">
            {{ tag.name }}{{ idx < note.tags.length - 1 ? '、' : '' }}
          </span>
        </div>
        <!-- Markdown 渲染后的内容 -->
        <div class="content markdown-body" v-html="renderedContent"></div>
      </div>
      <div class="modal-footer">
        <button @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

// ========== 初始化 Markdown 解析器 ==========
const md = new MarkdownIt({
  html: true,        // 允许 HTML 标签
  linkify: true,     // 自动识别链接
  typographer: true  // 启用一些语言中立的替换 + 引号美化
})

// ========== Props 定义 ==========
const props = defineProps({
  visible: Boolean,
  note: {
    type: Object,
    default: null
  }
})

// ========== Emits 定义 ==========
const emit = defineEmits(['close'])

// ========== 方法 ==========
const close = () => {
  emit('close')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// ========== 计算属性 ==========
const renderedContent = computed(() => {
  if (!props.note || !props.note.content) return ''
  return md.render(props.note.content)
})
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
  width: 800px;
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
  word-break: break-word;
  max-width: 90%;
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
.meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  gap: 20px;
}
.categories, .tags {
  margin-bottom: 12px;
  font-size: 14px;
}
.content {
  margin-top: 16px;
}
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}
.modal-footer button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-footer button:hover {
  background-color: #3aa876;
}

/* Markdown 样式（基于 GitHub 风格） */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2em; }
.markdown-body h2 { font-size: 1.5em; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}
.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', monospace;
}
.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}
.markdown-body pre code {
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
}
.markdown-body blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}
.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}
.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}
.markdown-body table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}
.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
}
</style>