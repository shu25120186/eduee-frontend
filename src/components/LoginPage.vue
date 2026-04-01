<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  errorMsg.value = ''

  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请填写用户名和密码'
    return
  }

  if (!isLogin.value && password.value !== confirmPassword.value) {
    errorMsg.value = '两次密码不一致'
    return
  }

  isLoading.value = true

  try {
    if (isLogin.value) {
      const res = await authApi.login(username.value.trim(), password.value)
      if (res.data.success) {
        userStore.username = username.value.trim()
        localStorage.setItem('username', username.value.trim())
        await userStore.loadGrowth()
        router.push('/')
      }
    } else {
      const res = await authApi.register(username.value.trim(), password.value)
      if (res.data.success) {
        alert('注册成功！请登录')
        isLogin.value = true
      }
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.detail || (isLogin.value ? '登录失败' : '注册失败')
  } finally {
    isLoading.value = false
  }
}

const switchMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">🏝️</div>
        <h1>伏特自律岛</h1>
        <p>EduEE 学习成长平台</p>
      </div>

      <div class="tab-switch">
        <button :class="{ active: isLogin }" @click="isLogin = true">登录</button>
        <button :class="{ active: !isLogin }" @click="isLogin = false">注册</button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :autocomplete="isLogin ? 'current-password' : 'new-password'"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label>确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="login-footer">
        <p @click="switchMode">
          {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
        </p>
      </div>
    </div>

    <div class="features-preview">
      <div class="feature-item">
        <span class="feature-icon">🍅</span>
        <span>番茄专注</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">📚</span>
        <span>英语模考</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🏆</span>
        <span>排行榜</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🤖</span>
        <span>AI助手</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  font-size: 56px;
  margin-bottom: 8px;
}

.login-header h1 {
  margin: 0;
  font-size: 28px;
  color: white;
}

.login-header p {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.tab-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-switch button {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
}

.tab-switch button.active {
  background: rgba(74, 222, 128, 0.25);
  border-color: rgba(74, 222, 128, 0.5);
  color: white;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
  border-color: rgba(74, 222, 128, 0.5);
}

.error-msg {
  color: #f87171;
  font-size: 13px;
  text-align: center;
}

.submit-btn {
  padding: 14px;
  background: rgba(74, 222, 128, 0.3);
  border: 1px solid rgba(74, 222, 128, 0.5);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
}

.login-footer p:hover {
  color: white;
}

.features-preview {
  display: flex;
  gap: 24px;
  margin-top: 32px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.feature-icon {
  font-size: 24px;
}
</style>
