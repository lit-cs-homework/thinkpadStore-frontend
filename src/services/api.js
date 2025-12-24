// src/services/api.js (或 api/index.js)
import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://ouc.it.srv.thinkpadstore.lighilit.top/',
  timeout: 5000, // 减少超时时间到5秒
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
      // 未授权，清除本地token并跳转登录
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
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

// 认证相关 API
export const authService = {
  // 用户登录
  login(credentials) {
    return apiClient.post('/login/', credentials)
  },

  // 刷新token
  refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token')
    return apiClient.post('/login/token/refresh/', { refresh: refresh_token })
  },

  // 用户注册 (如果后端支持)
  register(userData) {
    return apiClient.post('/user/', userData)
  },

  // 获取用户信息
  getUserInfo() {
    return apiClient.get('/user/me/')
  },

  // 登出
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
  }
}

// 其他服务...
// export const userService = { ... }
// export const orderService = { ... }

export default apiClient