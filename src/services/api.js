// src/services/api.js (或 api/index.js)
import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://ouc.it.srv.thinkpadstore.lighilit.top/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // 可以添加认证头等
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 添加认证 token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  response => response.data, // 直接返回 data，简化使用
  error => {
    // 统一错误处理
    console.error('API Error:', error.response?.status, error.message)
    
    // 可以根据状态码进行不同处理
    if (error.response?.status === 401) {
      // 未授权，跳转登录
      window.location.href = '/login'
    } else if (error.response?.status === 404) {
      // 资源不存在
      throw new Error('请求的资源不存在')
    }
    
    throw error
  }
)

// 产品相关 API
export const productService = {
  // 获取所有产品
  getAll() {
    return apiClient.get('/product/')
  },
  
  // 按ID获取产品
  getById(id) {
    return apiClient.get(`/product/${id}/`)
  }
}

// 购物车相关 API
export const cartService = {
  // 获取购物车列表
  getAll() {
    return apiClient.get('/cart/')
  },

  // 添加商品到购物车
  create(CartItem) {
    return apiClient.post('/cart/', CartItem)
  },

  // 获取单个购物车项
  getById(id) {
    return apiClient.get(`/cart/${id}/`)
  },

  // 更新购物车项（全量）
  update(id, CartItem) {
    return apiClient.put(`/cart/${id}/`, CartItem)
  },

  // 部分更新
  partialUpdate(id, CartItem) {
    return apiClient.patch(`/cart/${id}/`, CartItem)
  },

  // 删除购物车项
  delete(id) {
    return apiClient.delete(`/cart/${id}/`)
  }
}

// 其他服务...
// export const userService = { ... }
// export const orderService = { ... }

export default apiClient