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
            <div class="logo-icon">🎨</div>
            <div class="logo-text">ClothesGPT</div>
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
              placeholder="账户"
              size="large"
              @input="isSubmitted && validateUsername"
            >
              <template #prefix>
                <user-outlined class="site-form-item-icon" />
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
                <lock-outlined class="site-form-item-icon" />
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
                <safety-outlined class="site-form-item-icon" />
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
                <mail-outlined class="site-form-item-icon" />
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
              <a-alert :message="formError" type="error" show-icon />
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
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, SafetyOutlined, MailOutlined } from '@ant-design/icons-vue'

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
    usernameError.value = isSubmitted.value ? '账户不能为空' : ''
    return false
  }
  
  if (formState.username.length < 3) {
    usernameError.value = isSubmitted.value ? '账户不能少于3个字符' : ''
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
  
  try {
    loading.value = true
    // 这里模拟API调用，实际项目中应替换为真实的API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟成功登录/注册
    if (isLogin.value) {
      console.log('用户登录:', { username: username.value, password: password.value })
      // 登录成功后跳转到图片生成页面
      router.push('/')
    } else {
      console.log('用户注册:', { 
        username: username.value, 
        password: password.value,
        email: email.value 
      })
      
      // 注册成功后转到登录状态
      isLogin.value = true
      password.value = ''
      formError.value = '注册成功，请登录'
    }
  } catch (error) {
    console.error('登录/注册失败:', error)
    formError.value = isLogin.value ? '登录失败，请检查用户名和密码' : '注册失败，请稍后再试'
  } finally {
    loading.value = false
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
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(56, 189, 248, 0.1) 0%, transparent 80%),
    radial-gradient(circle at 90% 90%, rgba(14, 165, 233, 0.1) 0%, transparent 70%),
    linear-gradient(135deg, #0f172a, #1e293b);
  overflow: hidden;
  position: relative;
  color: #f8fafc;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.particle {
    position: absolute;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(14, 165, 233, 0.5));
    border-radius: 50%;
    filter: blur(3px);
    animation: float linear infinite;
  }
  

  @keyframes float {
    0% { transform: translateY(0) translateX(0) rotate(0deg); }
    25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
    50% { transform: translateY(0) translateX(20px) rotate(180deg); }
    75% { transform: translateY(20px) translateX(10px) rotate(270deg); }
    100% { transform: translateY(0) translateX(0) rotate(360deg); }
  }

.auth-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.auth-card {
  width: 420px;
  max-width: 90%;
  background: rgba(30, 41, 59, 0.7) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(56, 189, 248, 0.1);
  overflow: hidden;
  position: relative;
  animation: fadeIn 0.6s ease-out;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #38bdf8, #0ea5e9, #38bdf8);
  z-index: 1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
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

.logo-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s infinite;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.card-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.login-form {
  width: 100%;
}

.login-form-button {
  width: 100%;
  height: 46px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  transition: all 0.3s ease;
}

.login-form-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(14, 165, 233, 0.4);
}

.login-form-button:active:not(:disabled) {
  transform: translateY(0);
}

.site-form-item-icon {
  color: #64748b;
}

.form-footer {
  margin-top: 1rem;
}

.error-message {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.auth-switch {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #94a3b8;
}

.switch-link {
  color: #38bdf8;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.switch-link:hover {
  text-decoration: underline;
  color: #0ea5e9;
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
    color: #94a3b8 !important;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  
  .back-btn:hover {
    color: #38bdf8 !important;
    transform: translateY(-1px);
  }
  
  /* 响应式调整 */
  @media (max-width: 576px) {
    .auth-card {
      padding: 1.5rem;
    }
    
    .auth-content {
      padding: 1rem;
    }
  }
</style>