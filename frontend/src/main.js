/**
 * 应用入口文件
 * 创建 Vue 应用，挂载 Pinia 状态管理，并渲染到 DOM
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 创建 Pinia 实例
const pinia = createPinia()

// 创建 Vue 应用
const app = createApp(App)

// 使用 Pinia 插件
app.use(pinia)

// 挂载到 #app 元素
app.mount('#app')