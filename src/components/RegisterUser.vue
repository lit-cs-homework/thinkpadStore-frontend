<template>
  <div class="register-page">
    <header class="header">
    </header>

    <div class="content">
      <div class="left-banner"></div>

      <div class="register-card">
        <h2>注册联想账号</h2>

        <input
          v-model="form.username"
          type="text"
          placeholder="请输入用户名"
        />

        <input
          v-model="form.email"
          type="email"
          placeholder="请输入邮箱"
        />

        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
        />

        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码"
        />
        
        <button @click="handleSubmit">注册</button>

        <p class="login-link">
          已有账号？
          <span @click="$router.push('/login')">去登录</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/api'

export default {
  name: 'RegisterUser',
  data() {
    return {
      agree: false,
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.form.username || !this.form.email || !this.form.password) {
        alert('用户名、邮箱和密码不能为空')
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      try {
        await userService.register({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password
        })

        alert('注册成功，请登录')
        this.$router.push('/login')
      } catch (err) {
        console.error(err)
        alert('注册失败，请检查信息是否符合要求')
      }
    }
  }
}
</script>

<style scoped>
.register-page {
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

.register-card {
  width: 420px;
  background: #fff;
  border-radius: 10px;
  padding: 40px 30px;
  margin: auto 80px auto auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.register-card h2 {
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.register-card input {
  width: 100%;
  height: 44px;
  margin-bottom: 18px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.register-card input:focus {
  outline: none;
  border-color: #e2231a;
}

.agreement {
  display: flex;
  align-items: center;
  font-size: 13px;
  margin-bottom: 20px;
}

.agreement input {
  margin-right: 8px;
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

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.login-link span {
  color: #e2231a;
  cursor: pointer;
}
</style>
