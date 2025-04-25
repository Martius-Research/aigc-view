<template>
  <a-layout class="app-layout">
    <!-- 顶部导航栏 -->
    <a-layout-header class="app-header">
      <div class="logo">
        <!-- <img src="/path/to/your/logo.png" alt="Logo" /> -->

      </div>
      <div class="user-info">
        <a-dropdown placement="bottomRight">
          <div class="user-avatar-name">
            <UserOutlined/>
            <span class="user-name">{{ currentUser.name }}</span>
            <DownOutlined class="dropdown-arrow"/> <!-- Added arrow -->
          </div>
          <template #overlay>
            <a-menu @click="handleMenuClick">
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
          width="320"
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
            <span class="sider-title-icon">🎨</span> 参数设置
          </a-typography-title>

          <a-form layout="vertical" :model="params" class="sider-form">
            <a-form-item label="核心提示词 (Prompt)" class="form-label-strong">

              <div class="prompt-input-container">
                <a-textarea
                    v-model:value="params.prompt"
                    placeholder="输入图像描述，例如：一只戴着墨镜的可爱猫咪，写实风格"
                    :rows="5"
                    :disabled="isLoading"
                    show-count
                    :maxlength="1000"
                    class="custom-textarea"
                />
                <div class="prompt-buttons">
                  <a-button type="primary" :loading="rewrite" @click="rewritePrompt" class="enhance-button">提示词增强
                  </a-button>

                </div>
              </div>
            </a-form-item>

            <a-divider class="custom-divider"/>

            <a-form-item label="图像比例 (Aspect Ratio)" class="form-label-strong">
              <a-radio-group v-model:value="params.aspectRatio" button-style="solid" :disabled="isLoading"
                             class="ratio-group" @change="onRatioChange">
                <a-tooltip title="方形 (1:1)">
                  <a-radio-button value="1:1">
                    <IconSquare/>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="宽屏 (16:9)">
                  <a-radio-button value="16:9">
                    <IconRectangleWide/>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="竖屏 (9:16)">
                  <a-radio-button value="9:16">
                    <IconRectangle/>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="标准 (4:3)">
                  <a-radio-button value="4:3">
                    <Icon4x3/>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="竖向标准 (3:4)">
                  <a-radio-button value="3:4">
                    <Icon3x4/>
                  </a-radio-button>
                </a-tooltip>
                <a-tooltip title="自定义比例">
                  <a-radio-button value="custom" @click="showCustomRatioInput = true">
                    <IconEdit/>
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

          <!--          <a-alert v-if="error" :message="error" type="error" show-icon closable @close="error = null" class="error-alert"/>-->
        </div>
        <!-- Optional: Show an icon or button to expand when collapsed to 0 -->
        <!-- <div v-else class="collapsed-placeholder"></div> -->
      </a-layout-sider>

      <!-- 右侧图片展示区 -->
      <a-layout-content class="image-content-area">
        <a-spin :spinning="isLoading" tip="生成图像中，请稍候..." size="large" wrapperClassName="spin-wrapper">
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
              <PictureOutlined class="placeholder-icon"/>
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


import {h} from 'vue'; // Ensure h is imported if used for placeholders
const IconSquare = () => h('span', '1:1');
const IconRectangleWide = () => h('span', '16:9');
const IconRectangle = () => h('span', '9:16');
const Icon4x3 = () => h('span', '4:3');
const Icon3x4 = () => h('span', '3:4');
const IconEdit = () => h('span', '自定义'); // Added Custom Icon

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
    // Styles remain the same
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      height: 32px;
    }

    span {
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
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

      .ant-avatar {
        transition: transform 0.3s ease;
        border: 2px solid transparent;

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
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e6f0ff 100%);

  .sider-content {
    padding: 28px 18px 18px 18px;
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: linear-gradient(135deg, #f8fafc 0%, #e6f0ff 100%);
    border-radius: 0 12px 12px 0;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.06);

    .sider-title {
      margin-bottom: 24px;
      font-size: 20px;
      font-weight: 700;
      color: $primary-color;
      display: flex;
      align-items: center;
      gap: 8px;

      .sider-title-icon {
        font-size: 22px;
        margin-right: 4px;
      }
    }

    .sider-form {
      .form-label-strong {
        .ant-form-item-label > label {
          font-weight: 600;
          color: $text-color;
          font-size: 15px;
        }
      }

      .prompt-input-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .prompt-buttons {
        display: flex;
        gap: 8px;
      }

      .enhance-button {

        border: none;
        transition: all 0.2s;

        &:hover {

          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(19, 194, 194, 0.2);
        }
      }

      .custom-textarea {
        border-radius: 10px; // 更圆润的边角
        font-size: 15px;

        background: #ffffff; // 纯白背景
        border: 1px solid #d9e2f0; // 稍深的边框
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); // 添加细微阴影
        transition: border-color 0.3s ease, box-shadow 0.3s ease; // 平滑过渡
        &:focus-within {
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2); // 添加聚焦光晕效果
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
        margin-top: 2px;
        margin-bottom: 12px; // 为自定义比例区域留出空间
        display: flex; // Added for flex layout
        flex-wrap: wrap; // Allow wrapping on smaller screens
        gap: 6px; // Add gap between buttons horizontally and vertically when wrapped

        .ant-radio-button-wrapper {
          border-radius: 6px !important;
          margin-right: 0; // Remove right margin, use gap instead
          // margin-bottom: 6px; // Add bottom margin for wrapped items (gap handles this now)
          font-size: 14px;
          padding: 0 14px;
          background: #f0f7ff;
          border: 1px solid #b6d4fe;
          transition: all 0.2s;

          &:hover, &.ant-radio-button-wrapper-checked {
            background: $primary-color;
            color: #fff;
            border-color: $primary-color;
          }
        }
      }

      // 自定义比例区域样式
      .custom-ratio-container {
        margin-top: 12px;
        padding: 12px;
        background: #f7faff;
        border: 1px dashed #b6d4fe;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .custom-ratio-inputs {
          display: flex;
          align-items: center;
          gap: 8px;

          .custom-dimension-input {
            flex: 1;
            border-radius: 6px;
            background: #ffffff;
            border: 1px solid #dbeafe;
            font-size: 14px;

            &:focus-within {
              border-color: $primary-color;
            }
          }

          .dimension-separator {
            font-size: 16px;
            font-weight: bold;
            color: $text-color;
            margin: 0 4px;
          }
        }

        .apply-ratio-button {
          align-self: flex-end;
          border-radius: 6px;
          font-size: 14px;
          background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
          border: none;
          transition: all 0.2s;

          &:hover:not(:disabled) {
            background: linear-gradient(90deg, #40a9ff 0%, #69c0ff 100%);
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
          }

          &:disabled {
            background: #f0f0f0;
            color: rgba(0, 0, 0, 0.25);
          }
        }

        @media (max-width: 768px) {
          padding: 8px;
          gap: 8px;
        }
      }

      .custom-divider {
        margin: 18px 0 18px 0;
        border-top: 1.5px dashed #b6d4fe;
      }

      .generate-button.gradient-btn {
        background: linear-gradient(90deg, #1890ff 0%, #66e0ff 100%);
        border: none;
        color: #fff;
        font-weight: 600;
        font-size: 17px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.10);
        transition: background 0.2s, box-shadow 0.2s;

        &:hover {
          background: linear-gradient(90deg, #40a9ff 0%, #7fffd4 100%);
          box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
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
  padding: 24px; // Default padding
  background-color: $content-bg;
  height: 100%; // Fill parent height
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto; // Allow scrolling *if* content overflows (e.g., large error)

  .spin-wrapper,
  :deep(.ant-spin-container) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-display-container {
    width: 100%;
    height: 100%;
    max-width: 90vh; // Keep aspect ratio constraints
    max-height: 90vh;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;

    &.has-image {
      background-color: transparent;
      box-shadow: none;
    }

    .generated-image { /* Styles remain the same */
    }

    .placeholder {
      // Styles remain largely the same
      text-align: center;
      color: $text-color-secondary;
      padding: 30px; // Slightly smaller padding
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 100%;
      background-color: $placeholder-bg;
      border: 2px dashed $border-color;
      border-radius: 8px;

      .placeholder-icon {
        font-size: 40px; /*...*/
      }

      p {
        font-size: 15px; /*...*/
      }

      span {
        font-size: 12px; /*...*/
      }

      // Responsive placeholder adjustments
      @media (max-width: 768px) {
        padding: 20px;
        .placeholder-icon {
          font-size: 32px;
        }
        p {
          font-size: 14px;
        }
      }
    }
  }

  // Responsive padding
  @media (max-width: 768px) {
    padding: 16px;
  }
  @media (max-width: 576px) {
    padding: 12px;
  }
}
</style>