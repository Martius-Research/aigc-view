<template>
  <a-layout class="app-layout">
    <!-- 顶部导航栏 -->
    <a-layout-header class="app-header">
      <div class="logo">
        <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" fill="url(#paint0_linear)"/>
          <path d="M22 10C22 12.2091 20.2091 14 18 14C15.7909 14 14 12.2091 14 10C14 7.79086 15.7909 6 18 6C20.2091 6 22 7.79086 22 10Z" fill="white"/>
          <path d="M10 18C10 20.2091 8.20914 22 6 22C3.79086 22 2 20.2091 2 18C2 15.7909 3.79086 14 6 14C8.20914 14 10 15.7909 10 18Z" fill="white"/>
          <path d="M26 22C28.2091 22 30 20.2091 30 18C30 15.7909 28.2091 14 26 14C23.7909 14 22 15.7909 22 18C22 20.2091 23.7909 22 26 22Z" fill="white"/>
          <path d="M18 30C20.2091 30 22 28.2091 22 26C22 23.7909 20.2091 22 18 22C15.7909 22 14 23.7909 14 26C14 28.2091 15.7909 30 18 30Z" fill="white"/>
          <defs>
            <linearGradient id="paint0_linear" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stop-color="#1890FF"/>
              <stop offset="1" stop-color="#39DBFF"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="logo-text">ImagesGPT</span>
      </div>
      <div class="nav-links">
        <a class="nav-link active">图像生成</a>
       
      </div>
      <div class="user-info">
        <a-dropdown placement="bottomRight">
          <div class="user-avatar-name">
            <a-avatar class="user-avatar" :size="32" style="background-color: #1890ff">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="user-name">{{ currentUser.name }}</span>
            <DownOutlined class="dropdown-arrow"/>
          </div>
          <template #overlay>
            <a-menu @click="handleMenuClick" class="user-dropdown-menu">
              <a-menu-item key="profile">
                <template #icon>
                  <UserOutlined/>
                </template>
                个人中心
              </a-menu-item>
              <a-menu-divider/>
              <a-menu-item key="logout">
                <template #icon>
                  <LogoutOutlined/>
                </template>
                退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <!-- 主内容区 (包含侧边栏和图片区) -->
    <a-layout class="main-content-layout">
      <!-- 左侧参数栏 -->
      <a-layout-sider
          width="340"
          theme="light"
          class="parameter-sider"
          :collapsed="siderCollapsed"
          collapsible
          breakpoint="lg"
          :collapsed-width="siderCollapsedWidth"
          :trigger="siderCollapsedWidth === 0 && siderCollapsed ? null : undefined"
      >
        <div class="sider-content" v-if="!siderCollapsed || siderCollapsedWidth !== 0">
          <a-typography-title :level="5" class="sider-title">
            <span class="sider-title-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="url(#paint0_linear)"/>
                <path d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="url(#paint1_linear)"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#1890FF"/>
                    <stop offset="1" stop-color="#39DBFF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#1890FF"/>
                    <stop offset="1" stop-color="#39DBFF"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span class="sider-title-text">AI 图像生成</span>
          </a-typography-title>

          <a-form layout="vertical" :model="params" class="sider-form">
            <a-form-item label="核心提示词 (Prompt)" class="form-label-strong">
              <div class="label-description">描述您想要生成的图像内容，越详细越好</div>
              <div class="prompt-input-container">
                <a-textarea
                    v-model:value="params.prompt"
                    placeholder="输入图像描述，例如：一个印有插画的马克杯，质感温润，柔和的光线，高清细节"
                    :rows="5"
                    :disabled="isLoading"
                    show-count
                    :maxlength="1000"
                    class="custom-textarea"
                />
                <div class="prompt-buttons">
                  <a-button type="primary" :loading="rewrite" @click="rewritePrompt" class="enhance-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
                      <path d="M15.88 8.29L10 14.17L8.12 12.29C7.73 11.9 7.1 11.9 6.71 12.29C6.32 12.68 6.32 13.31 6.71 13.7L9.3 16.29C9.69 16.68 10.32 16.68 10.71 16.29L17.3 9.7C17.69 9.31 17.69 8.68 17.3 8.29C16.91 7.9 16.27 7.9 15.88 8.29Z" fill="white"/>
                    </svg>
                    提示词增强
                  </a-button>
                </div>
              </div>
            </a-form-item>

            <a-divider class="custom-divider"/>

            <a-form-item label="图像比例 (Aspect Ratio)" class="form-label-strong">
              <a-radio-group v-model:value="params.aspectRatio" button-style="solid" :disabled="isLoading"
                             class="ratio-group" @change="onRatioChange">
                <a-tooltip title="方形 (1:1)">
                  <a-radio-button value="1:1" class="ratio-button">
                    <div class="ratio-icon square-icon"></div>
                    <span class="ratio-text">1:1</span>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="宽屏 (16:9)">
                  <a-radio-button value="16:9" class="ratio-button">
                    <div class="ratio-icon wide-icon"></div>
                    <span class="ratio-text">16:9</span>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="竖屏 (9:16)">
                  <a-radio-button value="9:16" class="ratio-button">
                    <div class="ratio-icon vertical-icon"></div>
                    <span class="ratio-text">9:16</span>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="标准 (4:3)">
                  <a-radio-button value="4:3" class="ratio-button">
                    <div class="ratio-icon standard-icon"></div>
                    <span class="ratio-text">4:3</span>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="竖向标准 (3:4)">
                  <a-radio-button value="3:4" class="ratio-button">
                    <div class="ratio-icon vertical-standard-icon"></div>
                    <span class="ratio-text">3:4</span>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="自定义比例">
                  <a-radio-button value="custom" @click="showCustomRatioInput = true" class="ratio-button custom-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-icon">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                    <span class="ratio-text">自定义</span>
                  </a-radio-button>
                </a-tooltip>
              </a-radio-group>

              <!-- 自定义比例输入区域 -->
              <div v-if="showCustomRatioInput" class="custom-ratio-container">
                <div class="custom-ratio-inputs">
                  <a-input-number
                      v-model:value="customWidth"
                      :min="1"
                      :max="4096"
                      :disabled="isLoading"
                      placeholder="宽度"
                      class="custom-dimension-input"
                  />
                  <span class="dimension-separator">×</span>
                  <a-input-number
                      v-model:value="customHeight"
                      :min="1"
                      :max="4096"
                      :disabled="isLoading"
                      placeholder="高度"
                      class="custom-dimension-input"
                  />
                </div>
                <a-button
                    type="primary"
                    @click="applyCustomRatio"
                    :disabled="isLoading || !isCustomRatioValid"
                    class="apply-ratio-button"
                >
                  应用
                </a-button>
              </div>
            </a-form-item>


            <a-divider class="custom-divider"/>

            <a-form-item>
              <a-button
                  type="primary"
                  @click="handleGenerate"
                  :loading="isLoading"
                  block
                  size="large"
                  class="generate-button gradient-btn"
              >
                <template #icon>
                  <ThunderboltOutlined/>
                </template>
                立即生成
              </a-button>
            </a-form-item>
          </a-form>
        </div>

      </a-layout-sider>

      <!-- 右侧图片展示区 -->
      <a-layout-content class="image-content-area">
        <div class="content-header">
          <div class="content-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="url(#paint0_linear_image)"/>
              <defs>
                <linearGradient id="paint0_linear_image" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#1890FF"/>
                  <stop offset="1" stop-color="#39DBFF"/>
                </linearGradient>
              </defs>
            </svg>
            <span>图像预览</span>
          </div>
        </div>
        <a-spin :spinning="isLoading" tip="AI 正在创作您的图像，请稍候..." size="large" wrapperClassName="spin-wrapper">
          <div class="image-display-container" :class="{ 'has-image': !!generatedImageUrl }">
            <a-image
                v-if="generatedImageUrl"
                :src="generatedImageUrl"
                alt="生成的图片"
                class="generated-image"
                :preview="{ visible: false }"
                @click="previewVisible = true"
            />
            <div v-else class="placeholder">
              <div class="placeholder-icon-container">
                <PictureOutlined class="placeholder-icon"/>
              </div>
              <p>您的图像将在此呈现</p>
              <span>请在左侧输入描述并设置参数</span>
            </div>
          </div>
        </a-spin>
      </a-layout-content>
    </a-layout>

    <!-- 单独的图片预览 Modal -->
    <a-image
        :preview="{
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
          src: generatedImageUrl || undefined,
        }"
        style="display: none;"
    />
  </a-layout>
</template>

<script setup lang="ts">
import {ref, reactive, computed} from 'vue'; // Added watch
import {
  PictureOutlined,
  ThunderboltOutlined,
  LogoutOutlined,      // <-- Added
  UserOutlined,        // <-- Added
  DownOutlined,        // <-- Added
} from '@ant-design/icons-vue';
import {
  message,
  Modal,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  MenuDivider as AMenuDivider
} from 'ant-design-vue'; // Added Dropdown, Menu...
import type {MenuInfo} from 'ant-design-vue/lib/menu/src/interface'; // Type for menu click
import {useRouter} from 'vue-router'

const router = useRouter()


// 不再需要自定义图标组件，使用HTML和CSS实现

const currentUser = ref({
  name: '',
});

const rewrite = ref<boolean>(false)

const params = reactive({
  prompt: '',
  aspectRatio: '1:1',

});

// 自定义比例相关变量
const showCustomRatioInput = ref<boolean>(false); // 控制自定义输入框显示
const customWidth = ref<number | null>(1024);
const customHeight = ref<number | null>(1024);

// 判断自定义比例是否有效
const isCustomRatioValid = computed(() => {
  return customWidth.value && customHeight.value &&
      customWidth.value > 0 && customHeight.value > 0;
});

// 应用自定义比例
const applyCustomRatio = () => {
  if (!isCustomRatioValid.value) {
    message.warning('请输入有效的宽度和高度！');
    return;
  }
  // 设置比例为自定义格式 "宽*高"
  params.aspectRatio = `${customWidth.value}*${customHeight.value}`;

  message.success(`已应用自定义比例 ${customWidth.value}*${customHeight.value}`);
  params.aspectRatio = `${customWidth.value}*${customHeight.value}`;
};

const isLoading = ref<boolean>(false);
const generatedImageUrl = ref<string | null>(null);
const error = ref<string | null>(null);
const siderCollapsed = ref<boolean>(false);
const previewVisible = ref<boolean>(false);
const isMobile = ref(window.innerWidth < 992);


const siderCollapsedWidth = computed(() => isMobile.value ? 0 : 80);

// --- 方法 ---

// Update isMobile on resize
const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 992; // Match breakpoint="lg"
};

// Add/Remove resize listener
import {onMounted, onUnmounted, watch} from 'vue'; // Added watch here as well if not already present
import {jwtDecode} from 'jwt-decode';


/**
 * prompt rewrite
 */
async function rewritePrompt() {

  try {
    rewrite.value = true
    const response: AxiosResponse<IApiResponse> = await promptRewrite({
      prompt: params.prompt
    });

    const {
      data: {successful, resultHint, resultValue},
    } = response;
    if (!successful) message.error(resultHint);
    params.prompt = resultValue


  } catch (err) {
    console.log(err);

  } finally {
    rewrite.value = false
  }
}


onMounted(() => {
  const loginfo = localStorage.getItem("Authorization");
  if (loginfo) {
    const token = jwtDecode(loginfo);
    const userName = (token as { userName: string }).userName;
    currentUser.value.name = userName;
  }

  window.addEventListener('resize', updateIsMobile);
  updateIsMobile(); // Initial check
});
onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});


// Watch for changes in isMobile to potentially force collapse state if needed
watch(isMobile, (newVal) => {

  if (newVal && !siderCollapsed.value) {

  }
  console.log("isMobile changed:", newVal, "Collapsed Width:", siderCollapsedWidth.value);
});

// 当预设比例变化时，隐藏自定义输入框
const onRatioChange = (e: any) => {
  if (e.target.value !== 'custom') {
    showCustomRatioInput.value = false;
  }
};

const setPreviewVisible = (value: boolean): void => {
  previewVisible.value = value;
};

import type {AxiosResponse} from "axios";
import type {IApiResponse} from '@/interface/IApiResponse.ts'
import {generatorImg, promptRewrite} from "@/api/generator";


/**
 * generate image
 */
const handleGenerate = async () => {
  if (!params.prompt.trim()) {
    message.warning('请输入提示词！');
    return;
  }
  isLoading.value = true;
  generatedImageUrl.value = null;
  error.value = null;
  previewVisible.value = false;
  try {
    isLoading.value = true
    const response: AxiosResponse<IApiResponse> = await generatorImg({
      ...params
    });

    const {
      data: {successful, resultHint, resultValue},
    } = response;
    if (!successful) message.error(resultHint);
    generatedImageUrl.value = resultValue


  } catch (err) {
    console.log(err);

  } finally {
    isLoading.value = false
  }

};

// --- Menu Click Handler ---
const handleMenuClick = (e: MenuInfo) => {

  switch (e.key) {
    case 'profile':
      // Navigate to profile page or show profile modal
      message.info('待实现)');
      break;
    case 'logout':
      // Perform logout logic
      Modal.confirm({
        title: '确认退出?',
        content: '您确定要退出登录吗？',
        okText: '确认退出',
        cancelText: '取消',
        async onOk() {
          localStorage.removeItem('Authorization');
          await router.push('/login');
        },

        onCancel() {
          console.log('取消退出');
        },
      });
      break;
  }
};

</script>


<style lang="scss" scoped>

$primary-color: #1890ff;
$header-height: 64px;
$sider-width: 320px;
$sider-bg: #ffffff;
$content-bg: #f0f2f5;
$border-color: #e8e8e8;
$text-color: rgba(0, 0, 0, 0.85);
$text-color-secondary: rgba(0, 0, 0, 0.45);
$placeholder-bg: #fafafa;

// --- 整体布局 ---
.app-layout {
  height: 100vh;
  overflow: hidden; // Prevent top-level scrollbar
  background-color: $content-bg;
  
}

// --- 顶部导航栏 ---
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  padding: 0 24px;
  height: $header-height;
  line-height: $header-height;
  box-shadow: 0 4px 12px rgba(0, 21, 41, 0.06);
  z-index: 10;
  position: relative;
  transition: all 0.3s ease;
  
  

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.3), rgba(24, 144, 255, 0.1));
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 180px;

    .logo-icon {
      height: 32px;
      width: 32px;
      filter: drop-shadow(0 2px 4px rgba(24, 144, 255, 0.2));
      transition: transform 0.3s ease;
      
      &:hover {
        transform: rotate(15deg);
      }
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.5px;
    }
  }
  
  .nav-links {
    display: flex;
    gap: 24px;
    margin: 0 auto;
    
    .nav-link {
      position: relative;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);
      padding: 0 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        color: #1890ff;
      }
      
      &.active {
        color: #1890ff;
        font-weight: 600;
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #1890ff, #39DBFF);
          border-radius: 3px 3px 0 0;
        }
      }
    }
    
    @media (max-width: 768px) {
      display: none;
    }
  }

  .user-info {
    .user-avatar-name {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        background-color: rgba(24, 144, 255, 0.04);
        border-color: rgba(24, 144, 255, 0.1);
        transform: translateY(-1px);
      }

      .user-avatar {
        transition: all 0.3s ease;
        border: 2px solid transparent;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);

        &:hover {
          transform: scale(1.05);
          border-color: rgba(24, 144, 255, 0.2);
        }
      }
    }

    .user-name {
      color: $text-color;
      font-weight: 600;
      font-size: 15px;
      background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      // Responsive: Hide name on very small screens
      @media (max-width: 576px) {
        display: none;
      }
    }

    .dropdown-arrow {
      font-size: 12px;
      color: #1890ff;
      margin-left: 6px;
      transition: transform 0.3s ease;

      .user-avatar-name:hover & {
        transform: translateY(2px);
      }
    }
    
    .user-dropdown-menu {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      
      .ant-dropdown-menu-item {
        padding: 10px 16px;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: rgba(24, 144, 255, 0.04);
        }
      }
    }
  }

  // Responsive header padding
  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

// --- 主内容区布局 ---
.main-content-layout {
  // margin-top: $header-height; // No margin needed if header isn't fixed
  height: calc(100vh - #{$header-height}); // Correct height calculation
  overflow: hidden; // Prevent this layout from scrolling
}

// --- 左侧参数栏 ---
.parameter-sider {
  background: $sider-bg;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(24, 144, 255, 0.1);

  .sider-content {
    padding: 28px 18px 18px 18px;
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: linear-gradient(180deg, rgba(24, 144, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 0 12px 12px 0;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.06);

    .sider-title {
      margin-bottom: 28px;
      font-size: 20px;
      font-weight: 700;
      color: $primary-color;
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px dashed rgba(24, 144, 255, 0.15);

      .sider-title-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 4px;
        filter: drop-shadow(0 2px 4px rgba(24, 144, 255, 0.2));
      }
      
      .sider-title-text {
        background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
      }
    }

    .sider-form {
      .form-label-strong {
        margin-bottom: 8px;
        
        .ant-form-item-label > label {
          font-weight: 600;
          color: $text-color;
          font-size: 16px;
          background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .label-description {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: 8px;
          margin-top: -4px;
        }
      }

      .prompt-input-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 8px;
      }

      .prompt-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .enhance-button {
        border: none;
        transition: all 0.2s;
        background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
        border-radius: 6px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);

        &:hover {
          transform: translateY(-1px);
          background: linear-gradient(90deg, #40a9ff 0%, #69c0ff 100%);
          box-shadow: 0 4px 8px rgba(24, 144, 255, 0.25);
        }
      }

      .custom-textarea {
        border-radius: 12px;
        font-size: 15px;
        background: #ffffff;
        border: 1px solid rgba(24, 144, 255, 0.15);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        transition: all 0.3s ease;
        padding: 12px 16px;
        
        &:hover {
          border-color: rgba(24, 144, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        &:focus-within {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
          transform: translateY(-1px);
        }
        
        .ant-input {
          font-size: 15px;
        }
      }

      .custom-input-number {
        border-radius: 8px;
        background: #f7faff;
        border: 1px solid #dbeafe;
        font-size: 15px;
        padding: 2px 8px;

        &:focus-within {
          border-color: $primary-color;
        }
      }

      .ratio-group {
        margin-top: 8px;
        margin-bottom: 16px; // 为自定义比例区域留出空间
        display: flex; // Added for flex layout
        flex-wrap: wrap; // Allow wrapping on smaller screens
        gap: 10px; // Add gap between buttons horizontally and vertically when wrapped

        .ant-radio-button-wrapper {
          border-radius: 8px !important;
          margin-right: 0; // Remove right margin, use gap instead
          font-size: 14px;
          padding: 8px 12px;
          background: #f7faff;
          border: 1px solid rgba(24, 144, 255, 0.15);
          transition: all 0.3s ease;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          
          &.ratio-button {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 60px;
            padding: 10px 8px;
            
            .ratio-icon {
              width: 24px;
              height: 24px;
              border: 2px solid currentColor;
              border-radius: 4px;
              position: relative;
              transition: all 0.3s ease;
              opacity: 0.7;
            }
            
            .square-icon {
              width: 20px;
              height: 20px;
            }
            
            .wide-icon {
              width: 24px;
              height: 14px;
            }
            
            .vertical-icon {
              width: 14px;
              height: 24px;
            }
            
            .standard-icon {
              width: 24px;
              height: 18px;
            }
            
            .vertical-standard-icon {
              width: 18px;
              height: 24px;
            }
            
            .custom-icon {
              width: 20px;
              height: 20px;
              opacity: 0.7;
              transition: all 0.3s ease;
            }
            
            .ratio-text {
              font-size: 12px;
              font-weight: 500;
              transition: all 0.3s ease;
            }
          }

          &:hover {
            border-color: rgba(24, 144, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(24, 144, 255, 0.1);
            
            .ratio-icon, .custom-icon {
              opacity: 0.9;
            }
          }
          
          &.ant-radio-button-wrapper-checked {
            background: linear-gradient(135deg, #1890ff 0%, #39DBFF 100%);
            color: #fff;
            border-color: #1890ff;
            box-shadow: 0 4px 10px rgba(24, 144, 255, 0.25);
            
            .ratio-icon, .custom-icon {
              opacity: 1;
              border-color: #fff;
            }
            
            .ratio-text {
              font-weight: 600;
            }
          }
        }
      }

      // 自定义比例区域样式
      .custom-ratio-container {
        margin-top: 16px;
        padding: 16px;
        background: rgba(24, 144, 255, 0.03);
        border: 1px dashed rgba(24, 144, 255, 0.2);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        position: relative;
        
        &:before {
          content: '自定义尺寸';
          position: absolute;
          top: -10px;
          left: 16px;
          background: #fff;
          padding: 0 8px;
          font-size: 12px;
          color: rgba(24, 144, 255, 0.8);
          font-weight: 500;
        }

        .custom-ratio-inputs {
          display: flex;
          align-items: center;
          gap: 12px;

          .custom-dimension-input {
            flex: 1;
            border-radius: 8px;
            background: #ffffff;
            border: 1px solid rgba(24, 144, 255, 0.15);
            font-size: 14px;
            height: 40px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
            transition: all 0.3s ease;

            &:focus-within {
              border-color: #1890ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
            }
          }

          .dimension-separator {
            font-size: 18px;
            font-weight: bold;
            color: rgba(24, 144, 255, 0.6);
            margin: 0 4px;
          }
        }

        .apply-ratio-button {
          align-self: flex-end;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          height: 36px;
          padding: 0 16px;
          background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
          border: none;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
          transition: all 0.3s ease;

          &:hover:not(:disabled) {
            background: linear-gradient(90deg, #40a9ff 0%, #69c0ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
          }

          &:disabled {
            background: #f0f0f0;
            color: rgba(0, 0, 0, 0.25);
            box-shadow: none;
          }
          
          &:active:not(:disabled) {
            transform: translateY(1px);
            box-shadow: 0 2px 4px rgba(24, 144, 255, 0.15);
          }
        }

        @media (max-width: 768px) {
          padding: 12px;
          gap: 12px;
        }
      }

      .custom-divider {
        margin: 24px 0 24px 0;
        border-top: 1.5px dashed rgba(24, 144, 255, 0.15);
        position: relative;
        
        &:after {
          content: '';
          position: absolute;
          left: 50%;
          top: -5px;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background: #fff;
          border: 1.5px dashed rgba(24, 144, 255, 0.3);
          border-radius: 50%;
        }
      }

      .generate-button.gradient-btn {
        background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
        border: none;
        color: #fff;
        font-weight: 600;
        font-size: 17px;
        border-radius: 8px;
        height: 50px;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        transition: all 0.3s ease;
        margin-top: 8px;
        position: relative;
        overflow: hidden;
        
        &:before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          transition: transform 0.6s ease-out;
        }

        &:hover {
          background: linear-gradient(90deg, #40a9ff 0%, #69c0ff 100%);
          box-shadow: 0 6px 20px rgba(24, 144, 255, 0.25);
          transform: translateY(-2px);
          
          &:before {
            transform: scale(20);
            opacity: 0;
          }
        }
        
        &:active {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
        }
      }

      .error-alert {
        margin-top: 18px;
      }
    }

    @media (max-width: 768px) {
      padding: 14px 6px;
    }
  }

  .collapsed-placeholder {
    padding: 16px 0;
    text-align: center;
  }
}

// --- 右侧图片展示区 ---
.image-content-area {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  
  .content-header {
    margin-bottom: 20px;
    
    .content-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
      
      svg {
        filter: drop-shadow(0 2px 4px rgba(24, 144, 255, 0.15));
      }
      
      span {
        background: linear-gradient(90deg, #1890ff 0%, #39DBFF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }
  
  .spin-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .ant-spin-text {
      margin-top: 12px;
      font-size: 14px;
      color: #1890ff;
    }
    
    .ant-spin-dot-item {
      background-color: #1890ff;
    }
  }
  
  .image-display-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 12px;
    border: 1px dashed rgba(24, 144, 255, 0.15);
    padding: 20px;
    transition: all 0.3s ease;
    
    &.has-image {
      border: none;
      background: transparent;
    }
    
    .generated-image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        transform: scale(1.01);
        box-shadow: 0 12px 28px rgba(24, 144, 255, 0.15);
      }
    }
    
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: $text-color-secondary;
      padding: 40px;
      text-align: center;
      
      .placeholder-icon-container {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(24, 144, 255, 0.05);
        border-radius: 50%;
        margin-bottom: 20px;
        border: 1px dashed rgba(24, 144, 255, 0.2);
      }
      
      .placeholder-icon {
        font-size: 40px;
        color: rgba(24, 144, 255, 0.3);
      }
      
      p {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
        color: rgba(0, 0, 0, 0.65);
      }
      
      span {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
}
</style>