<template>
  <div class="login-page">
    <header class="header">
    </header>

    <div class="content">
      <div class="left-banner"></div>

      <div class="login-card">
        <h2>登录联想账号</h2>

        <input
          v-model="form.username"
          type="text"
          placeholder="请输入用户名"
        />

        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
        />

        <button @click="handleLogin">登录</button>

        <p class="register-link">
          还没有账号？
          <span @click="$router.push('/register')">立即注册</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/api'

export default {
  name: 'LoginUser',
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        alert('用户名和密码不能为空')
        return
      }
      try {
        const res = await userService.login({
          username: this.form.username,
          password: this.form.password
        })

        // 🔴 核心校验
        if (!res.access) {
          throw new Error('登录成功但未返回 access token')
        }

        // ✅ 正确保存 token
        localStorage.setItem('auth_token', res.access)
        localStorage.setItem('refresh_token', res.refresh)
        
        localStorage.setItem(
          'user_info',
          JSON.stringify({ username: this.form.username })
        )

        alert('登录成功')
        this.$router.push('/')
        //window.location.reload()
      } catch (err) {
        console.error(err)
        alert('登录失败，请检查用户名或密码')
      }
}

  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(to right, #d9f2ea, #58b49d);
}

.header {
  padding: 20px 40px;
}

.logo {
  height: 32px;
}

.content {
  display: flex;
  height: calc(100vh - 80px);
}

.left-banner {
  flex: 1;
  background: url('~@/assets/register-bg.png') no-repeat center center;
  background-size: cover;
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 10px;
  padding: 40px 30px;
  margin: auto 80px auto auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.login-card h2 {
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.login-card input {
  width: 100%;
  height: 44px;
  margin-bottom: 20px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.login-card input:focus {
  outline: none;
  border-color: #e2231a;
}

button {
  width: 100%;
  height: 44px;
  background: #e2231a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #c91e17;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.register-link span {
  color: #e2231a;
  cursor: pointer;
}
</style>
