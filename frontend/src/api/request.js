/**
 * API 请求模块 - 统一配置 axios
 */
import axios from 'axios'

// ========== 创建 axios 实例 ==========
// 设置基础 URL 为 '/api'，开发环境下会通过 Vite 代理转发到后端
const request = axios.create({
  baseURL: '/api'
})

// ========== 响应拦截器 ==========
// 统一处理返回数据格式，简化组件中的调用
request.interceptors.response.use(
  response => {
    // 后端返回的数据格式通常为 { code, data, message }
    // 这里直接返回 response.data，这样在组件中调用时就无需再 .data
    return response.data
  },
  error => {
    // 请求失败时打印错误并继续抛出
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default request