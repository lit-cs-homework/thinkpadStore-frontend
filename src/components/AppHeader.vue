<template>
  <div class="TitleBackground">
    <div class="Logo">
      <img alt="Lenovo Logo" src="@/assets/logo.png" />
      <span class="logo-text">联想商店</span>
    </div>

    <div class="header-actions">
      <!-- 用户认证状态 -->
      <div v-if="authState.isAuthenticated" class="user-section">
        <div class="user-avatar-dropdown" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
          <div class="user-avatar">
            <img src="@/assets/logo.png" alt="用户头像" />
          </div>
          <div v-if="showUserMenu" class="user-dropdown-menu">
            <div class="dropdown-item" @click="handleLogout">
              退出登录
            </div>
          </div>
        </div>
      </div>
      <div v-else class="login-section">
        <button class="login-btn" @click="goToLogin">登录</button>
      </div>

      <!-- 购物车 -->
      <div class="ShoppingCart" @click="showCartSidebar">
        <img alt="Shopping Cart" src="@/assets/logo.png" />
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

    // 注入购物车状态和方法
    const cartState = inject('cartState', { items: [] })
    const showCartSidebar = inject('showCartSidebar', () => {})
    const authState = inject('authState', { isAuthenticated: false })
    const logout = inject('logout', () => {})

    // 用户菜单显示状态
    const showUserMenu = ref(false)

    // 计算购物车商品数量
    const cartItemCount = computed(() => {
      return cartState.items ? cartState.items.length : 0
    })

    // 跳转到登录页面
    const goToLogin = () => {
      router.push('/login')
    }

    // 处理登出
    const handleLogout = () => {
      if (confirm('确定要退出登录吗？')) {
        logout()
        alert('已退出登录')
        router.push('/')
      }
    }

    return {
      cartItemCount,
      authState,
      showCartSidebar,
      showUserMenu,
      goToLogin,
      handleLogout
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
  max-width: 100px;
  height: auto;
  margin-right: 10px;
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