import axios from 'axios'

// 创建 axios 实例，配置基础 URL（使用代理，所以直接写 /api）
const request = axios.create({
  baseURL: '/api'
})

// 响应拦截器，统一处理返回格式
request.interceptors.response.use(
  response => {
    // 如果后端返回的是标准格式 { code, data }，这里直接返回 data
    // 但我们后端目前返回的 data 是嵌套在 { code, data } 里的，所以需要解构
    // 为了简化，我们让拦截器直接返回 response.data
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default request