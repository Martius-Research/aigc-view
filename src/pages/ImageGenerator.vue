<template>
  <div class="enterprise-container">
    <div class="header">
      <h1>图片创作平台</h1>
      <button class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span>
        退出
      </button>
    </div>
    
    <div class="main-content">
      <div class="input-panel">
        <div class="input-card">
          <div class="card-title">输入参数</div>
          
          <div class="prompt-group">
            <label for="prompt">提示词</label>
            <contextHolder />
            <Flex
              vertical
              gap="middle"
             
            >
              <Sender
                class="custom-sender"
                placeholder="请输入提示词"
                v-model:value="value"
                :loading="loading"
                @submit="() => {
                  value = '';
                  loading = true
                  messageApi.info('Send message!');
                }"
                @cancel="() => {
                  loading = false
                  messageApi.error('Cancel sending!');
                }"
              />
             
             
            </Flex>
          </div>
          
          <div class="tags-section">
            <div class="tags-label">
              <span>标签</span>
              <small>点击添加标签到提示词</small>
            </div>
            <div class="tags-container">
              <div 
                v-for="tag in suggestedTags" 
                :key="tag"
                :class="['tag-chip', selectedTags.includes(tag) ? 'active' : '']"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </div>
            </div>
          </div>
          
          <div class="options-container">
            <div class="option-group">
              <div class="option-label">图片风格</div>
              <div class="option-buttons">
                <button 
                  v-for="style in imageStyles" 
                  :key="style.value"
                  :class="['option-btn', 'style-btn', selectedStyle === style.value ? 'active' : '']"
                  @click="selectedStyle = style.value"
                >
                  <span class="style-icon">{{ style.icon }}</span>
                  {{ style.label }}
                </button>
              </div>
            </div>
            
            <div class="option-group">
              <div class="option-label">图片格式</div>
              <div class="option-buttons">
                <button 
                  v-for="format in imageFormats" 
                  :key="format.value"
                  :class="['option-btn', selectedFormat === format.value ? 'active' : '']"
                  @click="selectedFormat = format.value"
                >
                  {{ format.label }}
                </button>
              </div>
            </div>
            
            <div class="option-group">
              <div class="option-label">图片比例</div>
              <div class="option-buttons">
                <button 
                  v-for="ratio in imageRatios" 
                  :key="ratio.value"
                  :class="['option-btn', selectedRatio === ratio.value ? 'active' : '']"
                  @click="selectedRatio = ratio.value"
                >
                  {{ ratio.label }}
                </button>
                <button
                  :class="['option-btn', isCustomRatio ? 'active' : '']"
                  @click="toggleCustomRatio"
                >
                  自定义
                </button>
              </div>
              <div v-if="isCustomRatio" class="custom-ratio-inputs">
                <div class="ratio-input-group">
                  <input
                    type="number"
                    v-model="customWidth"
                    min="1"
                    placeholder="宽度"
                    class="ratio-input"
                  />
                  <span class="ratio-separator">:</span>
                  <input
                    type="number"
                    v-model="customHeight"
                    min="1"
                    placeholder="高度"
                    class="ratio-input"
                  />
                  <button 
                    class="apply-ratio-btn" 
                    @click="applyCustomRatio"
                    :disabled="!isValidCustomRatio"
                  >
                    应用
                  </button>
                </div>
                <div v-if="customRatioError" class="ratio-error">
                  {{ customRatioError }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="action-row">
            <button class="primary-btn" @click="generateImages" :disabled="isGenerating">
              <span class="btn-icon">{{ isGenerating ? '⟳' : '✓' }}</span>
              {{ isGenerating ? '正在生成...' : '生成图片' }}
            </button>
            <button class="secondary-btn" @click="clearForm" :disabled="isGenerating">
              清除
            </button>
          </div>
        </div>
      </div>
      
      <div class="results-panel" :class="{ 'loading': isGenerating }">
        <div v-if="isGenerating" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>正在生成您的图片，请稍候...</p>
        </div>
        
        <div v-if="!isGenerating && generatedImages.length === 0" class="empty-state">
          <div class="empty-icon">🖼️</div>
          <p>输入提示词并点击"生成图片"按钮开始</p>
        </div>
        
        <div v-if="generatedImages.length > 0" class="results-grid">
          <div v-for="(image, index) in generatedImages" :key="index" class="result-item">
            <div class="result-image">
              <div class="style-badge">{{ getStyleLabel(selectedStyle) }}</div>
              <img :src="image.url" :alt="`生成的图片 ${index + 1}`">
              <div class="image-overlay">
                <div class="image-actions">
                  <button class="overlay-btn approve" @click="approveImage(image)" :disabled="image.approved">
                    {{ image.approved ? '已确认' : '确认' }}
                  </button>
                  <button class="overlay-btn regenerate" @click="regenerateImage(index)">
                    重新生成
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="generatedImages.length > 0" class="batch-actions">
          <button class="text-btn" @click="regenerateBatch">
            <span class="btn-icon">↻</span> 生成新的一批
          </button>
          <button class="text-btn" @click="refinePrompt">
            <span class="btn-icon">✎</span> 调整提示词
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onWatcherCleanup, watch } from 'vue'
import { useRouter } from 'vue-router'

import { message, Flex } from 'ant-design-vue';
import { Sender } from 'ant-design-x-vue';

defineOptions({ name: 'AXSenderBasicSetup' });
const [messageApi, contextHolder] = message.useMessage();
const value = ref('');
const loading = ref<boolean>(false);
    watch(loading, () => {
        if (loading.value) {
          const timer = setTimeout(() => {
            loading.value = false;
            messageApi.success('Send message successfully!');
          }, 3000);
          onWatcherCleanup(() => {
            clearTimeout(timer);
          })
        }
    })
const router = useRouter()

// 退出登录
const handleLogout = () => {
  router.push('/login')
}

// 图片风格选项
const imageStyles = [
  { label: '写实风', value: 'realistic', icon: '🏞️' },
  { label: '漫画风', value: 'comic', icon: '💫' },
  { label: '可爱风', value: 'cute', icon: '🌸' },
  { label: '卡通风', value: 'cartoon', icon: '🎨' },
  { label: '抽象风', value: 'abstract', icon: '🎭' }
]

// 图片格式选项
const imageFormats = [
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'WEBP', value: 'webp' }
]

// 图片比例选项
const imageRatios = [
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' }
]

// 标签选项
const suggestedTags = [
  '高质量', '高清', '细节丰富', '阳光', '户外', 
  '室内', '明亮', '柔和', '复古', '现代', 
  '城市', '自然', '简约', '豪华', '时尚'
]

// 响应式状态
const prompt = ref('')
const selectedTags = ref<string[]>([])
const selectedStyle = ref('realistic')
const selectedFormat = ref('jpg')
const selectedRatio = ref('1:1')
const isGenerating = ref(false)
const generatedImages = ref<Array<{ url: string, approved: boolean }>>([])

// 自定义比例相关状态
const isCustomRatio = ref(false)
const customWidth = ref<number|null>(null)
const customHeight = ref<number|null>(null)
const customRatioError = ref('')

// 获取风格标签
const getStyleLabel = (styleValue: string) => {
  const style = imageStyles.find(s => s.value === styleValue)
  return style ? style.label : ''
}

// 切换标签
const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// 完整提示词计算属性
const fullPrompt = computed(() => {
  const stylePrefix = selectedStyle.value === 'realistic' ? '' : `${getStyleLabel(selectedStyle.value)}，`
  const tagsSuffix = selectedTags.value.length > 0 ? `，${selectedTags.value.join('，')}` : ''
  return `${stylePrefix}${prompt.value}${tagsSuffix}`
})

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

// 切换自定义比例
const toggleCustomRatio = () => {
  isCustomRatio.value = !isCustomRatio.value
  if (isCustomRatio.value) {
    // 初始化默认值为16:9
    customWidth.value = 16
    customHeight.value = 9
  } else {
    // 如果取消自定义，恢复为默认比例
    selectedRatio.value = '1:1'
  }
}

// 应用自定义比例
const applyCustomRatio = () => {
  if (isValidCustomRatio.value) {
    selectedRatio.value = `${customWidth.value}:${customHeight.value}`
  }
}

// 生成图片
const generateImages = async () => {
  if (!prompt.value.trim()) {
    alert('请输入提示词')
    return
  }
  
  isGenerating.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实的API请求
    console.log('生成图片的完整提示词:', fullPrompt.value)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟返回的图片数据
    const mockImages = [
      { url: 'https://via.placeholder.com/300x300/f5f5f5/333333?text=Image+1', approved: false },
      { url: 'https://via.placeholder.com/300x300/f5f5f5/333333?text=Image+2', approved: false },
      { url: 'https://via.placeholder.com/300x300/f5f5f5/333333?text=Image+3', approved: false },
      { url: 'https://via.placeholder.com/300x300/f5f5f5/333333?text=Image+4', approved: false }
    ]
    
    generatedImages.value = mockImages
  } catch (error) {
    console.error('生成图片时出错:', error)
    alert('生成图片时发生错误，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 清除表单
const clearForm = () => {
  prompt.value = ''
  selectedTags.value = []
  selectedStyle.value = 'realistic'
  selectedFormat.value = 'jpg'
  selectedRatio.value = '1:1'
  generatedImages.value = []
}

// 确认图片
const approveImage = (image: { url: string, approved: boolean }) => {
  image.approved = true
  alert(`已确认图片，将以 ${selectedFormat.value} 格式和 ${selectedRatio.value} 比例输出`)
  // 这里可以添加保存或下载逻辑
}

// 重新生成单张图片
const regenerateImage = async (index: number) => {
  isGenerating.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 替换单张图片
    const newImage = { url: `https://via.placeholder.com/300x300/f5f5f5/333333?text=New+Image+${index+1}`, approved: false }
    generatedImages.value[index] = newImage
  } catch (error) {
    console.error('重新生成图片时出错:', error)
    alert('重新生成图片时发生错误，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 生成新的一批图片
const regenerateBatch = () => {
  generateImages()
}

// 调整提示词
const refinePrompt = () => {
  // 可以在这里打开提示词编辑面板或添加其他交互
  const newPrompt = prompt.value + ' (已优化)'
  prompt.value = newPrompt
  generateImages()
}
</script>

<style scoped>
.custom-sender :deep(.ant-input) {
    color: white;
  }
  .custom-sender :deep(.ant-input::placeholder) {
    color: gray;
  }
  
  
.enterprise-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0c1220, #1a2234);
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(65, 105, 225, 0.1) 0%, transparent 80%),
    radial-gradient(circle at 90% 90%, rgba(0, 212, 255, 0.1) 0%, transparent 70%),
    linear-gradient(135deg, #0c1220, #1a2234);
  overflow: hidden;
  position: relative;
  color: #e2e8f0;
}

.enterprise-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.3), transparent);
  z-index: 1;
}

.enterprise-container::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(90deg, rgba(32, 56, 96, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(32, 56, 96, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.header {
  height: 60px;
  background: rgba(16, 24, 42, 0.7);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  padding: 0 28px;
  z-index: 10;
  position: relative;
  backdrop-filter: blur(10px);
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.2), transparent);
}

.logout-btn {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(220, 38, 38, 0.1);
  color: #ef4444;
  border: 1px solid rgba(220, 38, 38, 0.2);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 1rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
  display: flex;
  align-items: center;
}

h1::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #00bfff;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 0 10px #00bfff, 0 0 20px #00bfff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  height: calc(100vh - 60px);
}

.input-panel {
  width: 30%;
  min-width: 320px;
  overflow-y: auto;
}

.input-card {
  background-color: rgba(16, 24, 42, 0.7);
  border-radius: 14px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  will-change: transform, box-shadow;
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}

.input-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent);
  z-index: 1;
}

.input-card:hover {
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(59, 130, 246, 0.3),
    0 0 20px rgba(0, 191, 255, 0.1);
}

.card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  text-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
  position: relative;
}

.prompt-group {
  margin-bottom: 22px;
  position: relative;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  resize: none;
  transition: all 0.3s;
  font-family: inherit;
  background-color: rgba(15, 23, 42, 0.5);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #e2e8f0;
}

textarea:focus {
  outline: none;
  border-color: rgba(0, 191, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 191, 255, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: rgba(15, 23, 42, 0.7);
}

.tags-section {
  margin-bottom: 22px;
}

.tags-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tags-label span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.tags-label small {
  font-size: 0.75rem;
  color: #64748b;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  background-color: rgba(30, 41, 59, 0.7);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.tag-chip:hover {
  background-color: rgba(30, 41, 59, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 5px rgba(0, 191, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #e2e8f0;
}

.tag-chip.active {
  background-color: rgba(0, 65, 130, 0.5);
  color: #00bfff;
  border-color: rgba(0, 191, 255, 0.5);
  font-weight: 500;
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.1);
}

.tag-chip.active:hover {
  background-color: rgba(0, 65, 130, 0.7);
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.15);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-bottom: 24px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.option-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-btn {
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 0.8125rem;
  background-color: rgba(30, 41, 59, 0.7);
  color: #94a3b8;
  border: 1px solid rgba(59, 130, 246, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.option-btn:hover {
  background-color: rgba(30, 41, 59, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 5px rgba(0, 191, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #e2e8f0;
}

.option-btn.active {
  background-color: rgba(0, 65, 130, 0.5);
  color: #00bfff;
  border-color: rgba(0, 191, 255, 0.5);
  font-weight: 500;
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.1);
}

.option-btn.active:hover {
  background-color: rgba(0, 65, 130, 0.7);
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.15);
}

.style-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
}

.style-icon {
  font-size: 1.125rem;
}

.action-row {
  margin-top: auto;
  display: flex;
  gap: 12px;
}

.primary-btn, .secondary-btn {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #0050b3, #0091ff);
  color: white;
  border: none;
  flex: 2;
  box-shadow: 
    0 4px 10px rgba(0, 64, 255, 0.3),
    0 0 0 1px rgba(0, 191, 255, 0.2),
    0 0 20px rgba(0, 191, 255, 0.15);
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0058cc, #00a1ff);
  box-shadow: 
    0 6px 15px rgba(0, 64, 255, 0.4),
    0 0 0 1px rgba(0, 191, 255, 0.3),
    0 0 30px rgba(0, 191, 255, 0.2);
  transform: translateY(-2px);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 5px rgba(0, 64, 255, 0.3),
    0 0 0 1px rgba(0, 191, 255, 0.2);
}

.primary-btn:disabled {
  background: linear-gradient(135deg, #2d3a5a, #364366);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-btn {
  background-color: rgba(30, 41, 59, 0.7);
  color: #94a3b8;
  border: 1px solid rgba(59, 130, 246, 0.2);
  flex: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.secondary-btn:hover:not(:disabled) {
  background-color: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15), 0 0 5px rgba(0, 191, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.secondary-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 1.125rem;
}

.results-panel {
  flex: 1;
  background-color: rgba(16, 24, 42, 0.7);
  border-radius: 14px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: box-shadow 0.3s ease;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.results-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent);
  z-index: 1;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: #00bfff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  box-shadow: 0 0 20px rgba(0, 191, 255, 0.2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(0, 191, 255, 0.3));
  text-shadow: 0 0 20px rgba(0, 191, 255, 0.4);
  color: #00bfff;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

.result-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.2, 0, 0.2, 1);
  transform-origin: center bottom;
  background-color: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.result-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(59, 130, 246, 0.3),
    0 0 20px rgba(0, 191, 255, 0.15);
  z-index: 1;
}

.result-image {
  position: relative;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  background-color: rgba(15, 23, 42, 0.5);
}

.style-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, rgba(0, 50, 115, 0.8), rgba(0, 108, 176, 0.8));
  color: #00bfff;
  font-size: 0.6875rem;
  padding: 4px 10px;
  border-radius: 12px;
  z-index: 2;
  box-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.15),
    0 0 10px rgba(0, 191, 255, 0.2);
  backdrop-filter: blur(4px);
  letter-spacing: 0.5px;
  border: 1px solid rgba(0, 191, 255, 0.3);
}

.result-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.result-item:hover .result-image img {
  transform: scale(1.05);
}

.result-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.5), transparent);
  z-index: 2;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(10, 15, 30, 0.9), rgba(10, 15, 30, 0.5) 60%, transparent);
  padding: 25px 12px 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-item:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.overlay-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.overlay-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shine 3s infinite;
}

.approve {
  background: linear-gradient(135deg, #00623b, #00b676);
  color: white;
  box-shadow: 
    0 2px 5px rgba(0, 182, 118, 0.3),
    0 0 10px rgba(0, 182, 118, 0.2);
}

.approve:hover:not(:disabled) {
  background: linear-gradient(135deg, #007247, #00cc85);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(0, 182, 118, 0.4),
    0 0 15px rgba(0, 182, 118, 0.3);
}

.approve:active:not(:disabled) {
  transform: translateY(0);
}

.approve:disabled {
  background: linear-gradient(135deg, #2d3a5a, #364366);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.regenerate {
  background: linear-gradient(135deg, #a23c00, #ec6f00);
  color: white;
  box-shadow: 
    0 2px 5px rgba(236, 111, 0, 0.3),
    0 0 10px rgba(236, 111, 0, 0.2);
}

.regenerate:hover {
  background: linear-gradient(135deg, #b84500, #ff7b00);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px rgba(236, 111, 0, 0.4),
    0 0 15px rgba(236, 111, 0, 0.3);
}

.regenerate:active {
  transform: translateY(0);
}

.batch-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
}

.text-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.text-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.2), transparent);
  transition: transform 0.3s ease;
  transform: scaleX(0);
}

.text-btn:hover {
  background-color: rgba(30, 41, 59, 0.5);
  color: #00bfff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.text-btn:hover::after {
  transform: scaleX(1);
}

.text-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(59, 130, 246, 0.5);
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(0, 191, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(0, 191, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(0, 191, 255, 0.3); }
}

.enterprise-container {
  animation: fadeIn 0.5s ease;
}

.text-btn .btn-icon {
  transition: transform 0.3s ease, color 0.3s ease;
}

.text-btn:hover .btn-icon {
  transform: rotate(15deg);
  color: #00bfff;
  text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 16px;
    gap: 16px;
  }
  
  .input-panel {
    width: 35%;
  }
  
  .input-card, .results-panel {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 14px;
    gap: 14px;
  }
  
  .input-panel {
    width: 100%;
    max-height: 45vh;
  }
  
  .results-panel {
    max-height: calc(55vh - 88px);
  }
  
  .style-btn {
    padding: 7px 10px;
  }
  
  .option-btn {
    padding: 6px 10px;
  }
}

@media (max-width: 576px) {
  .header {
    padding: 0 16px;
  }
  
  .main-content {
    padding: 10px;
    gap: 10px;
  }
  
  .input-card, .results-panel {
    padding: 16px;
    border-radius: 12px;
  }
  
  .card-title {
    margin-bottom: 16px;
    padding-bottom: 10px;
  }
  
  .option-group, .tags-section, .prompt-group {
    margin-bottom: 16px;
  }
  
  .input-panel {
    max-height: 50vh;
  }
  
  .results-panel {
    max-height: calc(50vh - 80px);
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .tag-chip {
    padding: 4px 10px;
  }
  
  .batch-actions {
    gap: 12px;
  }
  
  .options-container {
    gap: 16px;
  }
}

.custom-ratio-inputs {
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(16, 24, 42, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ratio-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ratio-input {
  width: 70px;
  padding: 8px 10px;
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.875rem;
  text-align: center;
  transition: all 0.2s ease;
}

.ratio-input:focus {
  outline: none;
  border-color: rgba(0, 191, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.15);
  background-color: rgba(15, 23, 42, 0.7);
}

.ratio-separator {
  font-size: 1rem;
  color: #94a3b8;
  font-weight: bold;
}

.apply-ratio-btn {
  background: linear-gradient(135deg, #0050b3, #0091ff);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 64, 255, 0.2);
  flex-grow: 1;
}

.apply-ratio-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0058cc, #00a1ff);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 64, 255, 0.3);
}

.apply-ratio-btn:disabled {
  background: linear-gradient(135deg, #2d3a5a, #364366);
  cursor: not-allowed;
}

.ratio-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 6px;
}
</style>