<template>
  <div class="auth-container">
    <div class="auth-background">
      <div class="particles-container">
        <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
      </div>
    </div>

    <div class="auth-content">
      <a-card class="auth-card" :bordered="false">
        <div class="card-header">
          <div class="logo-container">

            <div class="logo-text"> </div>
          </div>
          <h1 class="card-title">{{ isLogin ? '欢迎回来' : '创建账号' }}</h1>
          <p class="card-subtitle">{{ isLogin ? '登录您的账号以继续' : '填写以下信息创建您的账号' }}</p>
        </div>

        <a-form
            :model="formState"
            class="login-form"
            @finish="handleSubmit"
        >
          <a-form-item>
            <a-input
                v-model:value="formState.username"
                placeholder="请输入用户名"
                size="large"
                @input="isSubmitted && validateUsername"
            >
              <template #prefix>
                <user-outlined class="site-form-item-icon"/>
              </template>
            </a-input>
            <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
          </a-form-item>

          <a-form-item>
            <a-input-password
                v-model:value="formState.password"
                placeholder="密码"
                size="large"
                @input="isSubmitted && validatePassword"
                :visibilityToggle="true"
                :visible="showPassword"
                @visibilityChange="togglePasswordVisibility"
            >
              <template #prefix>
                <lock-outlined class="site-form-item-icon"/>
              </template>
            </a-input-password>
            <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          </a-form-item>

          <a-form-item v-if="!isLogin">
            <a-input-password
                v-model:value="formState.confirmPassword"
                placeholder="确认密码"
                size="large"
                @input="isSubmitted && validateConfirmPassword"
                :visibilityToggle="true"
                :visible="showPassword"
                @visibilityChange="togglePasswordVisibility"
            >
              <template #prefix>
                <safety-outlined class="site-form-item-icon"/>
              </template>
            </a-input-password>
            <div v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</div>
          </a-form-item>

          <a-form-item v-if="!isLogin">
            <a-input
                v-model:value="formState.email"
                placeholder="邮箱地址"
                size="large"
                @input="isSubmitted && validateEmail"
            >
              <template #prefix>
                <mail-outlined class="site-form-item-icon"/>
              </template>
            </a-input>
            <div v-if="emailError" class="error-message">{{ emailError }}</div>
          </a-form-item>

          <a-form-item>
            <a-button
                type="primary"
                html-type="submit"
                class="login-form-button"
                :disabled="!isFormValid"
                size="large"
                :loading="loading"
            >
              {{ isLogin ? '登录' : '注册' }}
            </a-button>
          </a-form-item>

          <div class="form-footer">
            <div class="auth-switch">
              {{ isLogin ? '还没有账号？' : '已有账号？' }}
              <a class="switch-link" @click="toggleAuthMode">
                {{ isLogin ? '立即注册' : '去登录' }}
              </a>
            </div>

            <div v-if="formError" class="form-error">
              <a-alert :message="formError" type="error" show-icon/>
            </div>
          </div>
        </a-form>
      </a-card>
    </div>

    <div class="auth-footer">

    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {UserOutlined, LockOutlined, SafetyOutlined, MailOutlined} from '@ant-design/icons-vue'
import type {AxiosResponse} from "axios";
import type {IApiResponse} from '@/interface/IApiResponse.ts'

import {login, register} from '@/api/login.ts'

import {ElMessage} from 'element-plus'

const router = useRouter()

// 表单状态
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const showPassword = ref(false)
const loading = ref(false)

// 错误状态
const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const emailError = ref('')
const formError = ref('')

// 表单提交标志，用于控制是否显示验证错误
const isSubmitted = ref(false)

// 表单状态对象
const formState = reactive({
  username,
  password,
  confirmPassword,
  email
})

// 表单验证
const validateUsername = () => {
  if (!formState.username) {
    usernameError.value = isSubmitted.value ? '用户名不能为空' : ''
    return false
  }

  if (formState.username.length < 3) {
    usernameError.value = isSubmitted.value ? '用户名不能少于3个字符' : ''
    return false
  }

  usernameError.value = ''
  return true
}

const validatePassword = () => {
  if (!formState.password) {
    passwordError.value = isSubmitted.value ? '密码不能为空' : ''
    return false
  }

  if (formState.password.length < 6) {
    passwordError.value = isSubmitted.value ? '密码不能少于6个字符' : ''
    return false
  }

  passwordError.value = ''
  return true
}

const validateConfirmPassword = () => {
  if (!formState.confirmPassword) {
    confirmPasswordError.value = isSubmitted.value ? '请确认密码' : ''
    return false
  }

  if (formState.confirmPassword !== formState.password) {
    confirmPasswordError.value = isSubmitted.value ? '两次输入的密码不一致' : ''
    return false
  }

  confirmPasswordError.value = ''
  return true
}

const validateEmail = () => {
  if (!formState.email && !isLogin.value) {
    emailError.value = isSubmitted.value ? '邮箱不能为空' : ''
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!isLogin.value && !emailRegex.test(formState.email)) {
    emailError.value = isSubmitted.value ? '请输入有效的邮箱地址' : ''
    return false
  }

  emailError.value = ''
  return true
}

// 表单整体验证
const isFormValid = computed(() => {
  if (isLogin.value) {
    return validateUsername() && validatePassword()
  } else {
    return validateUsername() && validatePassword() && validateConfirmPassword() && validateEmail()
  }
})

// 切换密码可见性
const togglePasswordVisibility = (visible: boolean) => {
  showPassword.value = visible
}

// 切换登录/注册模式
const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  formError.value = '' // 切换模式时清除错误信息
  password.value = ''
  confirmPassword.value = ''
  usernameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  emailError.value = ''
  isSubmitted.value = false // 重置提交标志
}

// 提交表单
const handleSubmit = async () => {


  formError.value = '' // 清除可能的上一次错误
  isSubmitted.value = true // 设置提交标志为true

  // 重新验证表单
  validateUsername()
  validatePassword()
  if (!isLogin.value) {
    validateConfirmPassword()
    validateEmail()
  }

  if (!isFormValid.value) {
    formError.value = '请正确填写所有必填项'
    return
  }

  if (isLogin.value) {
    try {
      loading.value = true
      const response: AxiosResponse<IApiResponse> = await login({
        username: formState.username,
        password: formState.password,
      });

      const {
        data: {successful, resultHint,resultValue},
      } = response;
      if (!successful) return ElMessage({
        message: resultHint,
        type: 'error',
      })
      localStorage.setItem('Authorization', resultValue);
      router.push('/')

    } catch (err) {
      console.log(err);
    } finally {
      loading.value = false
    }

  } else {

    try {
      loading.value = true
      const response: AxiosResponse<IApiResponse> = await register({
        username: formState.username,
        password: formState.password,
        email: formState.email
      });

      const {
        data: {successful, resultHint},
      } = response;
      if (!successful) return resultHint
      ElMessage({
        message: "注册成功，请登录",
        type: 'success',
      })


    } catch (err) {
      console.log(err);
    } finally {
      isLogin.value = true
      password.value = ''
      loading.value = false

    }
  }


}


// 生成随机粒子样式
const getParticleStyle = (_index: number) => {
  const size = Math.floor(Math.random() * 20) + 10
  const posX = Math.random() * 100
  const posY = Math.random() * 100
  const animationDuration = Math.floor(Math.random() * 20) + 10
  const animationDelay = Math.random() * 5
  const opacity = Math.random() * 0.5 + 0.1

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${posX}%`,
    top: `${posY}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${animationDelay}s`,
    opacity: opacity
  }
}
</script>

<style scoped>
.auth-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* Updated background gradient for a richer dark feel */
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  /* Adjusted radial gradients for subtle highlights */
  background-image: radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 75%),
    radial-gradient(circle at 85% 80%, rgba(34, 211, 238, 0.09) 0%, transparent 65%),
    linear-gradient(135deg, #0f172a, #1e293b);
  overflow: hidden;
  position: relative;
  color: #e2e8f0;  
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
  /* Simplified background overlay */
  background: linear-gradient(120deg, rgba(15, 23, 42, 0.96) 50%, rgba(30, 41, 59, 0.94) 100%);
}

.particles-container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
}

.particle {
  position: absolute;
  /* Updated particle colors to match new theme */
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(34, 211, 238, 0.2));
  border-radius: 50%;
  filter: blur(7px); /* Slightly increased blur */
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(90deg);
  }
  50% {
    transform: translateY(0) translateX(20px) rotate(180deg);
  }
  75% {
    transform: translateY(20px) translateX(10px) rotate(270deg);
  }
  100% {
    transform: translateY(0) translateX(0) rotate(360deg);
  }
}

.auth-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  position: relative;
  z-index: 2;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  /* Darker card background with slightly more transparency */
  background: rgba(15, 23, 42, 0.9) !important;
  border-radius: 16px !important; /* Slightly adjusted radius */
  backdrop-filter: blur(12px);
  /* Updated shadow and border */
  box-shadow: 0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(59, 130, 246, 0.15);
  overflow: hidden;
  position: relative;
  animation: fadeIn 0.6s ease-out;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px; /* Slightly thicker */
  /* Updated gradient to match new theme */
  background: linear-gradient(90deg, #3b82f6, #22d3ee, #3b82f6);
  z-index: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo-text {
  font-size: 1.7rem;
  font-weight: 700;
  /* Updated logo text gradient */
  background: linear-gradient(135deg, #3b82f6, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc; /* Brighter title color */
  margin-bottom: 0.5rem;
  /* Updated text shadow */
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.25);
}

.card-subtitle {
  font-size: 0.95rem;
  color: #94a3b8; /* Adjusted subtitle color */
  margin-bottom: 1.2rem;
}

.login-form {
  width: 100%;
}

.login-form-button {
  width: 100%;
  height: 46px;
  font-size: 1rem;
  font-weight: 600;
  /* Updated button gradient */
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border: none !important;
  /* Updated button shadow */
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.28);
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
  color: #fff !important;
  border-radius: 8px !important;
}

.login-form-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.03);
  /* Updated hover shadow */
  box-shadow: 0 7px 20px rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, #2563eb, #1e40af) !important; /* Darker gradient on hover */
}

.login-form-button:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.site-form-item-icon {
  color: #60a5fa; /* Kept icon color, looks good */
  font-size: 1.1rem;
}

.a-input, .a-input-password {
  /* Slightly darker input background */
  background: rgba(30, 41, 59, 0.95) !important;
  border-radius: 8px !important;
  /* Slightly lighter border */
  border: 1px solid #475569 !important;
  color: #e2e8f0 !important; /* Match container text color */
  transition: border-color 0.2s, box-shadow 0.2s;
}

.a-input:focus, .a-input-password:focus {
  border-color: #3b82f6 !important; /* Updated focus border color */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); /* Added focus ring */
}

.a-input input, .a-input-password input {
  background: transparent !important;
  color: #e2e8f0 !important; /* Match container text color */
  font-size: 1rem;
}

.error-message {
  color: #fca5a5; /* Slightly softer error color */
  font-size: 0.8rem;
  margin-top: 0.18rem;
}

.form-footer {
  margin-top: 1.2rem;
}

.auth-switch {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.95rem;
  color: #94a3b8; /* Match subtitle color */
}

.switch-link {
  color: #60a5fa; /* Updated link color */
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
  text-decoration: none;
}

.switch-link:hover {
  text-decoration: underline;
  color: #3b82f6; /* Updated link hover color */
}

.form-error {
  margin-top: 1rem;
}

.auth-footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  z-index: 10;
  position: relative;
}

.back-btn {
  color: #a0aec0 !important;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #38bdf8 !important;
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .auth-card {
    padding: 1.2rem 0.5rem;
    max-width: 98vw;
    min-width: 0;
  }
  .auth-content {
    padding: 0.5rem;
  }
  .card-header {
    margin-bottom: 1.2rem;
  }
  .logo-text {
    font-size: 1.2rem;
  }
  .card-title {
    font-size: 1.1rem;
  }
}
@media (max-width: 480px) {
  .auth-card {
    padding: 0.7rem 0.2rem;
    border-radius: 10px !important;
  }
  .auth-content {
    padding: 0.2rem;
  }
  .logo-text {
    font-size: 1rem;
  }
  .card-title {
    font-size: 1rem;
  }
  .card-subtitle {
    font-size: 0.8rem;
  }
  .login-form-button {
    height: 40px;
    font-size: 0.95rem;
  }
}
</style>