<template>
  <div class="TitleBackground">
    <div class="Logo" @click="goHome">
      <img alt="Lenovo Logo" src="@/assets/Lenovo.png" />
      <span class="logo-text">联想商店</span>
    </div>

    <div class="header-actions">
      <!-- 用户认证状态 -->
      
      <!-- 未登录 -->
      <template v-if="!isLogin">
        <div class="ShoppingCart" @click="goRegister">
          <span>注册</span>
        </div>
        <div class="ShoppingCart" @click="goToLogin">
          <span>登录</span>
        </div>
      </template>

      <!-- 已登录 -->
      <template v-else>
        <div class="ShoppingCart user">
          <span>你好，{{ username }}</span>
        </div>
        <div class="ShoppingCart logout" @click="logout">
          <span>退出</span>
        </div>
      </template>

      <!-- 购物车 -->
      <div class="ShoppingCart" @click="showCartSidebar">
        <img alt="Shopping Cart" src="@/assets/shopping-cart.svg" />
        <span>购物车</span>
        <!-- 购物车商品数量显示 -->
        <span v-if="cartItemCount > 0" class="cart-badge">
          {{ cartItemCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter()

    // ===== 登录状态 =====
    const isLogin = ref(false)
    const username = ref('')

    // 从 localStorage 初始化
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      isLogin.value = true
      username.value = user.username || ''
    }

    // ===== 注入购物车 =====
    const cartState = inject('cartState', { items: [] })
    const showCartSidebar = inject('showCartSidebar', () => {})

    // 购物车数量
    const cartItemCount = computed(() => {
      return cartState.items ? cartState.items.length : 0
    })

    // ===== 路由跳转 =====
    const goToLogin = () => {
      router.push('/login')
    }

    const goRegister = () => {
      router.push('/register')
    }

    const goHome = () => {
      router.push('/')
    }

    // ===== 退出登录 =====
    const logout = () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')

      isLogin.value = false
      username.value = ''

      router.push('/')
    }

    return {
      // 状态
      isLogin,
      username,
      cartItemCount,

      // 方法
      goToLogin,
      goRegister,
      goHome,
      logout,
      showCartSidebar
    }
  }
}
</script>


<style scoped>
.TitleBackground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #f8f8f8;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.Logo {
  display: flex;
  align-items: center;
}

.Logo img {
  max-width: 200px;
  height: auto;
  margin-right: 20px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 头部操作区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 登录/登出按钮样式 */
.login-btn, .logout-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-btn:hover, .logout-btn:hover {
  background-color: #66b1ff;
}

.logout-btn {
  background-color: #f56c6c;
}

.logout-btn:hover {
  background-color: #f78989;
}

.welcome-text {
  color: #333;
  font-size: 14px;
  margin-right: 10px;
}

.user-section, .login-section {
  display: flex;
  align-items: center;
}

/* 用户头像和下拉菜单样式 */
.user-avatar-dropdown {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #409EFF;
  transition: border-color 0.3s ease;
}

.user-avatar:hover {
  border-color: #66b1ff;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 120px;
  margin-top: 5px;
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}

/* 购物车样式 */
.ShoppingCart {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.ShoppingCart img {
  max-width: 40px;
  height: auto;
  margin-right: 8px;
}

.ShoppingCart span {
  font-size: 16px;
  color: #333;
}

.ShoppingCart {
  margin-right: 20px;
}

/* 购物车徽章样式 */
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .Logo {
    padding: 5px 10px;
  }
  .Logo img {
    max-width: 80px;
    margin-right: 5px;
  }
  .logo-text {
    font-size: 16px;
    font-style: italic;
  }

  .header-actions {
    gap: 10px;
  }

  .login-btn, .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .welcome-text {
    font-size: 12px;
    margin-right: 8px;
  }

  .ShoppingCart {
    margin-right: 15px;
  }

  .ShoppingCart img {
    max-width: 35px;
  }

  .ShoppingCart span {
    font-size: 14px;
  }

  .cart-badge {
    min-width: 18px;
    height: 18px;
    font-size: 11px;
    top: -6px;
    right: -6px;
  }
}
</style>