<template>
  <div class="auth-container">

    <div class="auth-content">
      <a-card class="auth-card" :bordered="false">
        <div class="card-header">
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
        data: {successful, resultHint, resultValue},
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



</script>

<style scoped lang="scss">
 
// 颜色变量
$primary-color: #1890ff;
$primary-hover-color: #40a9ff;
$error-color: #ff4d4f;
$text-color-primary: rgba(0, 0, 0, 0.85);
$text-color-secondary: rgba(0, 0, 0, 0.45);
$text-color-tertiary: #94a3b8;
$bg-color: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);;
$white: #fff;
$link-color: #38bdf8;
$muted-color: #a0aec0;

// 尺寸变量
$border-radius: 16px;
$spacing-xs: 0.5rem;
$spacing-sm: 0.8rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

// 阴影
$box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);


 


// 混合器
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin text-center {
  text-align: center;
}

@mixin transition($property: all, $duration: 0.2s) {
  transition: $property $duration;
}

// 动画
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


.auth-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  //position: relative;
  position: fixed;
  top: 0;
  color: $text-color-primary;

}

.auth-content {
  flex: 1;
  @include flex-center;
  padding: $spacing-xl $spacing-md;
  position: relative;
  z-index: 2;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: $white ;
  border-radius: $border-radius !important;
  box-shadow: $box-shadow;
  overflow: hidden;
  position: relative;
  padding: $spacing-xl $spacing-lg;
}

.card-header {
  @include text-center;
  margin-bottom: $spacing-xl;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
  @include text-center;
}

.card-subtitle {
  font-size: 0.9rem;
  color: $text-color-secondary;
  margin-bottom: $spacing-lg;
  @include text-center;
  line-height: 1.5;
}

.login-form {
  width: 100%;
  
  &-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
    font-weight: 400;
  }
  :deep(.ant-input-affix-wrapper >input.ant-input){
   background-color: white;
 }
}

.site-form-item-icon {
  color: $text-color-secondary;
  font-size: 16px;
  margin-right: 8px;
}

.a-input, .a-input-password {
  margin-bottom: $spacing-xs;
  background-color: $white;
  
  input {
    font-size: 14px;
    background-color: $white;
    border-radius: 8px;
  }
}

.error-message {
  color: $error-color;
  font-size: 14px;
  margin-top: 4px;
}

.form-footer {
  margin-top: 1.2rem;
}

.auth-switch {
  margin-top: $spacing-md;
  @include text-center;
  font-size: 0.95rem;
  color: $text-color-tertiary; /* Match subtitle color */
}

.switch-link {
  color: $primary-color;
  cursor: pointer;
  font-weight: 400;
  margin-left: 4px;
  @include transition(color);
  text-decoration: none;
  
  &:hover {
    color: $primary-hover-color;
  }
}

.form-error {
  margin-top: $spacing-md;
}

.auth-footer {
  height: 40px;
  @include flex-center;
  padding: 0 $spacing-md;
  position: relative;
  color: $text-color-secondary;
  font-size: 14px;
  @include text-center;
  
  &::before {
    content: '';
  }
}

.back-btn {
  color: $muted-color !important;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  @include transition(color);
  
  &:hover {
    color: $link-color !important;
    transform: translateY(-1px);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .auth-card {
    max-width: 90vw;
    padding: $spacing-lg $spacing-md;
  }

  .auth-content {
    padding: $spacing-md;
  }

  .card-header {
    margin-bottom: $spacing-md;
  }

  .card-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .auth-content {
    padding: $spacing-xs;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-subtitle {
    font-size: 0.85rem;
  }
}
</style>