<template>
  <div class="login-page">
    <header>
      <AppHeader/>
    </header>
    <main class="login-content">
      <div class="login-container">
        <div class="login-form">
          <h2>用户登录</h2>

          <!-- 错误提示 -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="username">用户名</label>
              <input
                type="text"
                id="username"
                v-model="loginForm.username"
                required
                placeholder="请输入用户名"
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <input
                type="password"
                id="password"
                v-model="loginForm.password"
                required
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>

          <div class="login-footer">
            <p>还没有账号？<a href="#" @click="showRegister">立即注册</a></p>
            <p><a href="#" @click="goHome">返回首页</a></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import { authService } from '@/services/api'

export default {
  name: 'LoginPage',
  components: {
    AppHeader
  },
  setup() {
    const router = useRouter()

    // 响应式数据
    const loading = ref(false)
    const error = ref('')
    const loginForm = ref({
      username: '',
      password: ''
    })

    // 检查是否已经登录
    const checkLoginStatus = () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // 已登录，跳转到首页
        router.push('/')
      }
    }

    // 处理登录
    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''

        const response = await authService.login(loginForm.value)

        // 保存token
        if (response.access && response.refresh) {
          localStorage.setItem('auth_token', response.access)
          localStorage.setItem('refresh_token', response.refresh)

          // 登录成功，跳转到首页
          router.push('/')

          // 可以显示成功消息
          alert('登录成功！')
        } else {
          error.value = '登录响应格式异常，请重试'
        }

      } catch (err) {
        console.error('登录失败:', err)

        // 根据错误类型显示不同的错误信息
        if (err.response?.status === 401) {
          error.value = '用户名或密码错误'
        } else if (err.response?.status === 400) {
          error.value = '输入信息有误，请检查后重试'
        } else if (err.code === 'NETWORK_ERROR') {
          error.value = '网络连接异常，请检查网络后重试'
        } else {
          error.value = '登录失败，请稍后重试'
        }
      } finally {
        loading.value = false
      }
    }

    // 显示注册页面（预留功能）
    const showRegister = () => {
      alert('注册功能暂未开放，请联系管理员创建账号')
    }

    // 返回首页
    const goHome = () => {
      router.push('/')
    }

    // 组件挂载时检查登录状态
    onMounted(() => {
      checkLoginStatus()
    })

    return {
      loading,
      error,
      loginForm,
      handleLogin,
      showRegister,
      goHome
    }
  }
}
</script>

<style scoped>
.login-page {
  padding-top: 60px; /* 抵消固定头部 */
  min-height: 100vh;
  background: #f5f5f5;
}

.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-form {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #409EFF;
}

.login-btn {
  width: 100%;
  background-color: #409EFF;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  background-color: #66b1ff;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-footer p {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}

.login-footer a {
  color: #409EFF;
  text-decoration: none;
  cursor: pointer;
}

.login-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-content {
    padding: 10px;
  }

  .login-form {
    padding: 20px;
  }

  .login-form h2 {
    font-size: 20px;
  }

  .form-group input {
    padding: 10px;
    font-size: 14px;
  }
}
</style>