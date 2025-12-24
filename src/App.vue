<template>
  <div id="app">
    <router-view/>

    <!-- 全局购物车侧边栏 -->
    <ShoppingCart
      v-if="cartState.isVisible"
      :is-sidebar="true"
      @close="closeCartSidebar"
    />

    <!-- 遮罩层 -->
    <div
      v-if="cartState.isVisible"
      class="cart-overlay"
      @click="closeCartSidebar"
    ></div>
  </div>
</template>

<script>
import { provide, reactive, onMounted } from 'vue'
import ShoppingCart from './components/ShoppingCart.vue'

export default {
  name: 'App',
  components: {
    ShoppingCart
  },
  setup() {
    // 购物车状态管理
    const cartState = reactive({
      isVisible: false,
      items: []
    })

    // 认证状态管理
    const authState = reactive({
      isAuthenticated: false,
      token: null,
      user: null
    })

    // 检查登录状态
    const checkAuthStatus = () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        authState.isAuthenticated = true
        authState.token = token
      }
    }

    // 显示购物车侧边栏
    const showCartSidebar = () => {
      cartState.isVisible = true
    }

    // 关闭购物车侧边栏
    const closeCartSidebar = () => {
      cartState.isVisible = false
    }

    // 登录方法
    const login = (token, refreshToken) => {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refreshToken)
      authState.isAuthenticated = true
      authState.token = token
    }

    // 登出方法
    const logout = () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      authState.isAuthenticated = false
      authState.token = null
      authState.user = null
    }

    // 组件挂载时检查登录状态
    onMounted(() => {
      checkAuthStatus()
    })

    // 提供给子组件的全局状态和方法
    provide('cartState', cartState)
    provide('showCartSidebar', showCartSidebar)
    provide('authState', authState)
    provide('login', login)
    provide('logout', logout)

    return {
      cartState,
      authState,
      closeCartSidebar,
      logout
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

/* 购物车遮罩层样式 */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: opacity 0.3s ease;
}
</style>
