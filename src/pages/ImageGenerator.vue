<template>
  <div class="ig-root">
    <header class="ig-header">
      <div class="ig-logo"></div>
      <div class="ig-title"></div>
      <div class="ig-user-section">
        <a-dropdown placement="bottomRight">
          <div class="ig-user-name">
            <span class="user-icon">👤</span>{{ userName || '用户' }}
            <span class="dropdown-icon">▼</span>
          </div>
          <template #overlay>
            <a-menu class="user-dropdown-menu">
              <a-menu-item key="logout" @click="handleLogout">
                <span class="logout-icon">🚪</span>退出
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </header>
    <main class="ig-main">
      <section class="ig-controls">
        <div class="ig-card">
          <div class="ig-card-title">参数设置</div>
          <div class="ig-form-row">
            <label>图片风格</label>
            <a-select v-model:value="selectedStyle"
                      class="ig-select">
              <a-select-option
                  v-for="style in imageStyles"
                  :key="style.label"
                  :value="style.label">
                                <span
                                    class="style-icon">{{ style.icon }}</span>
                {{ style.label }}
              </a-select-option>
            </a-select>
          </div>

          <div class="ig-form-row">
            <label>图片比例</label>
            <a-select v-model:value="selectedRatio"
                      class="ig-select"
                      @change="handleRatioChange">
              <a-select-option
                  v-for="ratio in imageRatios"
                  :key="ratio.value"
                  :value="ratio.value">
                {{ ratio.label }}
              </a-select-option>
              <a-select-option key="custom"
                               value="custom">自定义
              </a-select-option>
            </a-select>
            <div v-if="isCustomRatio"
                 class="ig-custom-ratio">
              <input type="number" v-model="customWidth"
                     min="1" placeholder="宽度"
                     class="ig-input-short"/>
              <span class="ig-ratio-sep">*</span>
              <input type="number"
                     v-model="customHeight" min="1"
                     placeholder="高度"
                     class="ig-input-short"/>
              <button class="ig-btn ig-btn-mini"
                      @click="applyCustomRatio"
                      :disabled="!isValidCustomRatio">应用
              </button>
              <span v-if="customRatioError"
                    class="ig-error">{{ customRatioError }}</span>
            </div>
          </div>
          <div class="ig-form-row">
            <label>提示词</label>
            <a-textarea v-model:value="prompt"  placeholder="请输入提示词" show-count :maxlength="200" />
           
             
          </div>
          <div class="ig-actions">
            <button class="ig-btn ig-btn-primary"
                    @click="generateImages"
                    :disabled="isGenerating">
                            <span v-if="isGenerating"
                                  class="ig-spinner"></span>
              {{ isGenerating ? '生成中...' : '生成图片' }}
            </button>
            <button class="ig-btn ig-btn-secondary"
                    @click="clearForm"
                    :disabled="isGenerating">清除
            </button>
          </div>
        </div>
      </section>
      <section class="ig-results">

        <div v-for="(image, index) in generatedImages" :key="index">
          <a-image :src="image.url"
                   :preview="true"
          >

          </a-image>
        </div>

      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {ref,  computed, onWatcherCleanup, watch, onMounted} from 'vue'
import {useRouter} from 'vue-router'

import {
  message,
  Select as ASelect,
  SelectOption as ASelectOption,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem
} from 'ant-design-vue'
import type {SelectProps} from 'ant-design-vue/es/select'

import {generatorImg} from '@/api/generator.ts'
import type {AxiosResponse} from "axios"
import type {IApiResponse} from "@/interface/IApiResponse.ts"

import {ElMessage} from "element-plus"
import {jwtDecode} from "jwt-decode"

defineOptions({name: 'AXSenderBasicSetup'})
const [messageApi,  ] = message.useMessage()
// let value = ref('') 
const loading = ref<boolean>(false)
watch(loading, () => {
  if (loading.value) {
    const timer = setTimeout(() => {
      loading.value = false
      messageApi.success('Send message successfully!')
    }, 3000)
    onWatcherCleanup(() => {
      clearTimeout(timer)
    })
  }
})
const router = useRouter()

// 用户信息
const userName = ref('')

// 获取用户信息
const getUserInfo = () => {
  const token = localStorage.getItem("Authorization")
  if (token) {
    try {
      const decoded: any = jwtDecode(token)
      if (decoded) {
        // 优先使用 userName，如果不存在则使用 userId
        if (decoded.userName) {
          userName.value = decoded.userName
        } else if (decoded.userId) {
          userName.value = `用户${decoded.userId}`
        } else {
          userName.value = '用户'
        }
      }
    } catch (error) {
      console.error("解析 JWT 失败:", error)
      userName.value = '用户'
    }
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo()



})

// 退出登录
const handleLogout = () => {
  router.push('/login')
  localStorage.removeItem('Authorization')
  userName.value = ''
}

// 图片风格选项
const imageStyles = [
  {label: '写实风', value: 'realistic', icon: '🏞️'},
  {label: '漫画风', value: 'comic', icon: '💫'},
  {label: '可爱风', value: 'cute', icon: '🌸'},
  {label: '卡通风', value: 'cartoon', icon: '🎨'},
  {label: '抽象风', value: 'abstract', icon: '🎭'}
]

// 图片格式选项
// const imageFormats = [
//     { label: 'JPG', value: 'jpg' },
//     { label: 'PNG', value: 'png' },
//     { label: 'WEBP', value: 'webp' }
// ]

// 图片比例选项
const imageRatios = [
  {label: '原图比例', value: 'original'}, // 增加原图比例
  {label: '1:1 (方形)', value: '1:1'},    // 增加描述
  {label: '4:3 (标准横屏)', value: '4:3'},
  {label: '3:4 (标准竖屏)', value: '3:4'},
  {label: '16:9 (宽屏)', value: '16:9'},
  {label: '9:16 (竖屏)', value: '9:16'},
  {label: '3:2 (照片横屏)', value: '3:2'}, // 根据需要增加
  {label: '2:3 (照片竖屏)', value: '2:3'}, // 根据需要增加
];


// 响应式状态
const prompt = ref('')
const selectedTags = ref<string[]>([])
const selectedStyle = ref('modern')
const selectedFormat = ref('png')
const selectedRatio = ref('1024*1024')
const isGenerating = ref(false)
const generatedImages = ref<Array<{ url: string, approved: boolean }>>([])

// 自定义比例相关状态
const isCustomRatio = ref(false)
const customWidth = ref<number | null>(null)
const customHeight = ref<number | null>(null)
const customRatioError = ref('')


// 获取风格标签
// const getStyleLabel = (styleValue: string) => {
//     const style = imageStyles.find(s => s.label === styleValue)
//     return style ? style.label : ''
// }


// 完整提示词计算属性
// const fullPrompt = computed(() => {
//   const stylePrefix = selectedStyle.value === '写实风' ? '' : `${getStyleLabel(selectedStyle.value)}，`
//   const tagsSuffix = selectedTags.value.length > 0 ? `，${selectedTags.value.join('，')}` : ''
//   return `${stylePrefix}${prompt.value}${tagsSuffix}`
// })

// 验证自定义比例
const isValidCustomRatio = computed(() => {
  if (!customWidth.value || !customHeight.value) {
    return false
  }

  if (customWidth.value <= 0 || customHeight.value <= 0) {
    customRatioError.value = '宽度和高度必须大于0'
    return false
  }

  customRatioError.value = ''
  return true
})

// 应用自定义比例
const applyCustomRatio = () => {
  if (isValidCustomRatio.value) {
    selectedRatio.value = `${customWidth.value}*${customHeight.value}`
  }
}

// 生成图片
const generateImages = async () => {
  if (!prompt.value.trim()) {
    ElMessage({
      message: "提示词不能为空，请输入有效内容。",
      type: 'error',
    })
    return
  }
  const loginfo = localStorage.getItem("Authorization")
  if (loginfo) {
    try {
      const token: { userId: string } = jwtDecode(loginfo)
      if (token) {

        try {


          isGenerating.value = true
          const response: AxiosResponse<IApiResponse> = await generatorImg({
            prompt: prompt.value,
            style: selectedStyle.value,
            size: selectedRatio.value,
          })

          const {
            data: {successful, resultHint, resultValue},
          } = response
          if (!successful) return ElMessage({
            message: resultHint,
            type: 'error',
          })
          if (!resultValue) return ElMessage({
            message: "您已经达到Free限额",
            type: 'error',
          })

          ElMessage({
            message: "生成成功！",
            type: 'success',
          })
          generatedImages.value = [
            {
              url: resultValue,
              approved: true
            }
          ]



        } catch (err) {
          console.log(err)
        } finally {
          isGenerating.value = false
        }
      }
    } catch (error) {
      console.error("JWT 解码失败:", error)
    }
  }


}

// 清除表单
const clearForm = () => {
  prompt.value = ''
  selectedTags.value = []
  selectedStyle.value = '写实风'
  selectedFormat.value = 'jpg'
  selectedRatio.value = '1:1'
  generatedImages.value = []
}


// // 生成新的一批图片
// const regenerateBatch = () => {
//     generateImages()
// }

// // 调整提示词
// const refinePrompt = () => {
//     // 可以在这里打开提示词编辑面板或添加其他交互
//     const newPrompt = prompt.value + ' (已优化)'
//     prompt.value = newPrompt
//     generateImages()
// }

// Handle ratio selection from dropdown
const handleRatioChange: SelectProps['onChange'] = (value) => {
  const selectedValue = String(value)
  if (selectedValue === 'custom') {
    isCustomRatio.value = true
    if (!customWidth.value || !customHeight.value) {
      // Set default custom values if not already set
      customWidth.value = 16
      customHeight.value = 9
    }
    // Update selectedRatio when custom is chosen and inputs are valid
    if (isValidCustomRatio.value) {
      selectedRatio.value = `${customWidth.value}:${customHeight.value}`
    }
  } else {
    isCustomRatio.value = false
    selectedRatio.value = selectedValue
  }
}
</script>

<style scoped>
.ig-root {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  background-image: radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 75%),
  radial-gradient(circle at 85% 80%, rgba(34, 211, 238, 0.10) 0%, transparent 65%);
  color: #f1f5f9;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.ig-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 48px;
  background: rgba(15, 23, 42, 0.98);
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(59, 130, 246, 0.25);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(14px);
  transition: all 0.3s cubic-bezier(.4, 0, .2, 1);
}

.ig-logo {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2.5px;
  text-shadow: 0 0 18px rgba(59, 130, 246, 0.35);
}

.ig-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 8px rgba(59, 130, 246, 0.08);
}

.ig-user-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.ig-user-name {
  display: flex;
  align-items: center;
  background: rgba(59, 130, 246, 0.13);
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 1.05rem;
  color: #f8fafc;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.18);
  border: 1px solid rgba(59, 130, 246, 0.22);
  cursor: pointer;
}

.ig-user-name:hover {
  background: rgba(59, 130, 246, 0.18);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 24px rgba(59, 130, 246, 0.22);
}

.user-icon {
  margin-right: 10px;
  font-size: 1.2rem;
  color: #38bdf8;
}

.dropdown-icon {
  margin-left: 10px;
  font-size: 0.8rem;
  color: #94a3b8;
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
}

.ig-user-name:hover .dropdown-icon {
  color: #3b82f6;
}

.user-dropdown-menu {
  background: rgba(15, 23, 42, 0.98) !important;
  backdrop-filter: blur(14px);
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
}

:deep(.ant-dropdown-menu-item) {
  background: transparent !important;
  color: #f8fafc !important;
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
  padding: 12px 20px;
  font-size: 1rem;
}

:deep(.ant-dropdown-menu-item:hover) {
  background: rgba(244, 63, 94, 0.13) !important;
  color: #f43f5e !important;
}

.logout-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.ig-main {
  display: flex;
  gap: 48px;
  padding: 48px 56px 0 56px;
  min-height: calc(100vh - 72px);
  margin-top: 72px;
  height: calc(100vh - 72px);
  overflow: hidden;
  background: rgba(15, 23, 42, 0.98);
  align-items: stretch;
}

.ig-controls {
  flex: 0 0 360px;
  max-width: 360px;
  transition: all 0.3s cubic-bezier(.4, 0, .2, 1);
  height: 100%;
}

.ig-card {
  background: rgba(30, 41, 59, 0.96);
  border-radius: 24px;
  box-shadow: 0 10px 36px 0 rgba(0, 0, 0, 0.32);
  padding: 36px 32px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  border: 1.5px solid rgba(59, 130, 246, 0.22);
  backdrop-filter: blur(14px);
  transition: all 0.3s cubic-bezier(.4, 0, .2, 1);
  animation: cardFadeIn 0.5s cubic-bezier(.4, 0, .2, 1);
  height: 100%;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ig-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 14px;
  letter-spacing: 1.2px;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid rgba(59, 130, 246, 0.13);
  padding-bottom: 18px;
}

.ig-card-title::before {
  content: '✨';
  margin-right: 10px;
  font-size: 1.2rem;
}

.ig-form-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  animation: fadeIn 0.3s cubic-bezier(.4, 0, .2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ig-form-row label {
  font-size: 1.05rem;
  font-weight: 600;
  color: #a5b4fc;
  margin-bottom: 6px;
}
 :deep(.ant-input-textarea-show-count::after){
   color: white;
 }  
.ig-select {
  width: 100%;
  background: rgba(15, 23, 42, 0.7);
  color: #f1f5f9;
  border: 1.5px solid rgba(59, 130, 246, 0.22);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
  font-size: 1rem;
  font-weight: 500;
}

.ig-select:hover {
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 0 0 2.5px rgba(59, 130, 246, 0.13);
}

.ig-custom-ratio {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  border: 1.5px solid rgba(59, 130, 246, 0.13);
}

.ig-input-short {
  width: 70px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.7);
  border: 1.5px solid rgba(59, 130, 246, 0.22);
  border-radius: 10px;
  color: #f1f5f9;
  text-align: center;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
}

.ig-input-short:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2.5px rgba(59, 130, 246, 0.18);
  outline: none;
}

.ig-ratio-sep {
  font-weight: 700;
  font-size: 1.25rem;
  color: #3b82f6;
}

.ig-actions {
  display: flex;
  gap: 16px;
  margin-top: 14px;
}

.ig-btn {
  padding: 12px 22px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: #111;
}

.ig-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.ig-btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.ig-btn-primary:disabled {
  background: linear-gradient(135deg, #64748b, #475569);
  color: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.ig-btn-secondary {
  background: transparent;
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.ig-btn-secondary:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.ig-btn-secondary:disabled {
  border-color: rgba(148, 163, 184, 0.2);
  color: #64748b;
  cursor: not-allowed;
}

.ig-btn-mini {
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
}

.ig-btn-link {
  background: transparent;
  color: #3b82f6;
  border: none;
  text-decoration: none;
  padding: 4px 8px;
  font-size: 0.9rem;
}

.ig-btn-link:hover {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 6px;
}

.ig-btn-confirm {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.ig-btn-confirm:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.ig-btn-confirm:disabled {
  background: linear-gradient(135deg, #0f766e, #0d9488);
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.ig-error {
  color: #f43f5e;
  font-size: 0.85rem;
  margin-top: 4px;
}

.ig-results {
  flex: 1;
  position: relative;
  padding: 0px 0 40px;
  transition: all 0.3s ease;
  overflow-y: hidden;
  height: 100%;
}

.ig-sender {
  --ax-sender-bg: rgba(15, 23, 42, 0.6);
  --ax-sender-border-color: rgba(59, 130, 246, 0.2);
  --ax-sender-placeholder-color: #ffffff;
  --ax-sender-text-color: #f8fafc;
  --ax-sender-border-radius: 10px;
  --ax-sender-focusable-border-color: #3b82f6;
  --ax-sender-focusable-shadow-color: rgba(59, 130, 246, 0.2);
  --ax-sender-submit-button-bg: linear-gradient(135deg, #3b82f6, #1d4ed8);
  --ax-sender-submit-button-color: #ffffff;
  --ax-sender-submit-button-hover-bg: linear-gradient(135deg, #2563eb, #1e40af);
  width: 100%;
}

.ig-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #94a3b8;
  border: 2px dashed rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  margin-top: 20px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(5px);
  animation: fadeIn 0.5s ease-out;
}

:deep(.ant-sender .ant-sender-input::placeholder) {
  color: white;
}

:deep(.ant-sender .ant-sender-input) {
  color: white;
}

.ig-empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.ig-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.3s ease-out;
}

.ig-loader {
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.ig-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

.ig-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Slightly smaller min width */
  gap: 20px; /* Slightly smaller gap */
  margin-top: 20px;

  animation: fadeIn 0.5s ease-out;
}

.ig-img-card {
  background: rgba(30, 41, 59, 0.85);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: translateY(0);
  animation: cardFadeIn 0.5s ease-out;
  animation-fill-mode: both;
  display: flex; /* Use flexbox for centering */
  justify-content: center;
  align-items: center;
  aspect-ratio: 1 / 1; /* Maintain square aspect ratio, adjust as needed */
}

.ig-img-card:hover {
  transform: translateY(-6px) scale(1.03); /* Adjusted hover effect */
  box-shadow: 0 10px 25px 0 rgba(59, 130, 246, 0.25); /* Brighter shadow on hover */
  border-color: rgba(59, 130, 246, 0.4);
}

.ig-image-item {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the card area */
  transition: transform 0.3s ease;
}

.ig-img-card:hover .ig-image-item {
  transform: scale(1.05); /* Slight zoom on image hover */
}

.ig-img-wrap {
  position: relative;
  overflow: hidden;
}

.ig-img-wrap img {
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.ig-img-wrap:hover img {
  transform: scale(1.05);
}

.ig-img-style {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(15, 23, 42, 0.8);
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #e2e8f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.ig-img-actions {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.ig-batch-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.style-icon {
  margin-right: 6px;
}

/* 响应式布局适配 */
@media (max-width: 1200px) {
  .ig-main {
    gap: 30px;
    padding: 30px 30px 0 30px;
  }

  .ig-controls {
    flex: 0 0 320px;
    max-width: 320px;
  }

  .ig-card {
    padding: 25px 22px 20px 22px;
  }
}

@media (max-width: 900px) {
  .ig-main {
    flex-direction: column;
    padding: 24px 24px 0 24px;
    overflow-y: auto;
  }

  .ig-controls {
    flex: 0 0 auto;
    max-width: 100%;
    width: 100%;
  }

  .ig-card {
    padding: 24px 20px 20px 20px;
    margin-bottom: 24px;
  }

  .ig-results {
    padding-bottom: 80px;
  }

  .ig-gallery {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  .ig-batch-actions {
    position: sticky;
    bottom: 20px;
    z-index: 50;
    margin-top: 20px;
  }
}

@media (max-width: 600px) {
  .ig-header {
    padding: 0 20px;
    height: auto;
    flex-wrap: wrap;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .ig-logo {
    font-size: 1.5rem;
    width: 50%;
  }

  .ig-title {
    display: none;
  }

  .ig-user-section {
    width: 50%;
    justify-content: flex-end;
  }

  .ig-user-name {
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  .ig-logout {
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .ig-main {
    padding: 16px 16px 0 16px;
    margin-top: 64px;
    height: calc(100% - 64px);
  }

  .ig-card {
    border-radius: 16px;
    padding: 20px 16px 16px 16px;
    margin-bottom: 16px;
  }

  .ig-card-title {
    font-size: 1.1rem;
  }

  .ig-form-row {
    margin-bottom: 16px;
  }

  .ig-btn {
    padding: 8px 14px;
    font-size: 0.9rem;
  }

  .ig-gallery {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .ig-batch-actions {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 12px;
  }

  .ig-btn-link {
    width: 100%;
    padding: 8px 0;
    text-align: center;
  }

  .ig-empty {
    height: 300px;
  }

  .ig-custom-ratio {
    flex-wrap: wrap;
  }

  .ig-actions {
    flex-direction: column;
  }
}

@media (max-width: 375px) {
  .ig-header {
    padding: 8px 12px;
  }

  .ig-logo {
    font-size: 1.2rem;
  }

  .ig-user-name {
    display: none;
  }

  .ig-main {
    padding: 12px 12px 0 12px;
    margin-top: 56px;
    height: calc(100% - 56px);
  }

  .ig-card {
    padding: 16px 12px 12px 12px;
  }
}
</style>