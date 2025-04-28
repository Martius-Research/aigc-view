<template>
  <a-layout>

    <a-layout-header class="app-header">
      <!-- 右侧用户区域 -->
      <div class="user-area">
        <a-button 
          @click="openSubscriptionSettings" 
          class="subscribe-header-btn"
          style="margin-right: 16px;"
        >
          <template #icon><CrownOutlined /></template>
          升级订阅
        </a-button>
        <a-dropdown class="user-dropdown">
          <a class="ant-dropdown-link user-dropdown-trigger" @click.prevent>

            <UserOutlined />
            <span class="username">{{ username }}</span>
            <DownOutlined class="dropdown-arrow"/>
          </a>
          <template #overlay>
            <a-menu @click="handleMenuClick" class="user-dropdown-menu">
               
              <a-menu-item key="settings">
                <SettingOutlined/>
                系统设置
              </a-menu-item>
              <a-menu-divider/>
              <a-menu-item key="logout">
                <LogoutOutlined/>
                退出系统
              </a-menu-item>


            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout class="dashboard-layout">
      <a-layout-sider width="360" class="dashboard-sider">
        <div class="sider-content">
          <a-menu
            v-model:selectedKeys="selectedMode"
            mode="inline"
            theme="light"
            class="mode-menu"
          >
            <a-menu-item v-for="mode in generationModes" :key="mode.key">
              <template #icon><component :is="mode.icon" /></template>
              {{ mode.name }}
            </a-menu-item>
          </a-menu>

          <!-- 根据选择的模式显示内容 -->
          <div v-if="selectedMode.includes('text-to-image')" class="mode-content">
            <a-card title="文生图" class="form-card" :bordered="false">
              <div class="form-section">
                <div class="form-item">
                  <label class="form-label">提示词</label>
                  <a-textarea
                    v-model:value="params.prompt"
                    placeholder="请输入图像描述，例如：'夕阳下的海滩'，'太空中的飞船'，'梦幻花园'..."
                    :rows="4"
                    class="prompt-textarea"
                    :maxLength="500"
                    showCount
                />
                <a-button
                    @click="rewritePrompt"
                    class="rewrite-btn"
                    type="primary"
                    
                    size="small"
                    :loading="rewrite"
                >
                  <ThunderboltOutlined/>
                  提示词增强
                </a-button>
              </div>

              <a-divider/>

              <div class="form-item">
                <label class="form-label">比例选择</label>
                <div class="ratio-options">
                  <a-tabs default-active-key="preset">
                    <a-tab-pane key="preset" tab="预设比例">
                      <a-radio-group v-model:value="params.aspectRatio" button-style="solid" class="ratio-radio-group">
                        <a-radio-button value="1:1">1:1 正方形</a-radio-button>
                        <a-radio-button value="4:3">4:3 标准</a-radio-button>
                        <a-radio-button value="16:9">16:9 宽屏</a-radio-button>
                        <a-radio-button value="9:16">9:16 竖屏</a-radio-button>
                        <a-radio-button value="3:4">3:4 竖构图</a-radio-button>
                        <a-radio-button value="2:3">2:3 人像</a-radio-button>
                        <a-radio-button value="3:2">3:2 风景</a-radio-button>
                      </a-radio-group>
                    </a-tab-pane>
                    <a-tab-pane key="custom" tab="自定义比例">
                      <div class="custom-ratio">
                        <a-input-number v-model:value="customWidth" :min="1" :max="2048" placeholder="宽"
                                        addon-before="宽"/>
                        <a-input-number v-model:value="customHeight" :min="1" :max="2048" placeholder="高"
                                        addon-before="高"/>
                        <a-button type="primary" @click="applyCustomRatio">应用</a-button>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane key="sizes" tab="尺寸推荐">
                      <a-list size="small">
                        <a-list-item @click="selectPresetSize('1024*1024')" class="preset-size-item">
                          <a-tag color="blue">1024 × 1024</a-tag>
                          标准正方形
                        </a-list-item>
                        <a-list-item @click="selectPresetSize('1024*1792')" class="preset-size-item">
                          <a-tag color="purple">1024 × 1792</a-tag>
                          垂直海报
                        </a-list-item>
                        <a-list-item @click="selectPresetSize('1792*1024')" class="preset-size-item">
                          <a-tag color="green">1792 × 1024</a-tag>
                          水平横幅
                        </a-list-item>
                        <a-list-item @click="selectPresetSize('896*1152')" class="preset-size-item">
                          <a-tag color="orange">896 × 1152</a-tag>
                          手机壁纸
                        </a-list-item>
                      </a-list>
                    </a-tab-pane>
                  </a-tabs>
                </div>
              </div>
              <a-divider/>
              <label class="form-label">模型选择</label>
              <div class="form-item">
                <a-select
                    class="model-select"
                    v-model:value="imageVal"
                    show-search
                    placeholder="请选择模型"
                    style="width: 200px"
                    :options="imageOptions"
                    :filter-option="filterOption"
                    @change="handleChange"
                ></a-select>
              </div>
              <a-divider/>
              <div class="form-item">
                <a-button
                    type="primary"
                    class="generate-btn"
                    size="large"
                    block
                    :loading="isLoading"
                    :disabled="!params.prompt"
                    @click="generateImage"
                >
                  <PictureOutlined/>
                  生成图片
                </a-button>
              </div>
              </div>
            </a-card>
          </div>

          <!-- 未来其他模式的占位符 -->
          <div v-if="selectedMode.includes('image-to-image')" class="mode-content">
             <a-card title="图生图 (开发中)" class="form-card" :bordered="false">
                <a-empty description="此功能正在开发中..." />
             </a-card>
          </div>
           <div v-if="selectedMode.includes('text-to-video')" class="mode-content">
             <a-card title="文生视频 (开发中)" class="form-card" :bordered="false">
                <a-empty description="此功能正在开发中..." />
             </a-card>
          </div>

        </div>
      </a-layout-sider>
      <a-layout-content class="dashboard-content">
        <div v-if="generatedImageUrl" class="result-container">
          <a-image
              :src="generatedImageUrl"
              class="result-image"
              :preview="{ visible: previewVisible, onVisibleChange: (visible: boolean) => previewVisible = visible }"
          />
          <div class="image-actions">
            <a-button type="primary">
              <template #icon>
                <DownloadOutlined/>
              </template>
              下载
            </a-button>
            <a-button @click="() => previewVisible = true">
              <template #icon>
                <EyeOutlined/>
              </template>
              预览
            </a-button>

          </div>
        </div>
        <div v-else class="placeholder-container">
          <a-empty description="生成图片将在此处展示"/>
        </div>
      </a-layout-content>
      <a-modal
          v-model:open="open"
          title="系统设置"
          width="60vw"
          centered
          :footer="null"
          :maskClosable="false"
          class="settings-modal"
      >
        <div class="settings-container">
          <div class="settings-sidebar">
            <a-menu
                v-model:selectedKeys="selectedSettingKey"
                mode="inline"
                class="settings-menu"
            >
            <a-menu-item key="general">
                <template #icon><SettingOutlined /> /></template>
                通用设置
            </a-menu-item>
              <a-menu-item key="account">
                <template #icon><UserOutlined /></template>
                账号信息
              </a-menu-item>
              <a-menu-item key="subscription">
                <template #icon><CreditCardOutlined /></template>
                订阅管理
              </a-menu-item>
              <a-menu-item key="usage">
                <template #icon><BarChartOutlined /></template>
                使用统计
              </a-menu-item>
              <a-menu-item key="appearance">
                <template #icon><SkinOutlined /></template>
                外观设置
              </a-menu-item>
              <a-menu-item key="notification">
                <template #icon><BellOutlined /></template>
                通知设置
              </a-menu-item>
             
            </a-menu>
          </div>
          <div class="settings-content">
            <div v-if="selectedSettingKey.includes('general')" class="settings-panel">
                <h3>通用设置</h3>
                <a-divider />
                <h4>账户管理</h4>
                <div class="account-management">
                  <p class="delete-warning">
                    请注意：注销账户是一个不可逆的操作。您的所有数据，包括生成的图片和个人信息，都将被永久删除。
                  </p>
                  <a-button type="primary" danger @click="showDeleteConfirm">
                    <template #icon><ExclamationCircleOutlined /></template>
                    注销账户
                  </a-button>
                </div>
                
              </div>
            <div v-if="selectedSettingKey.includes('account')" class="settings-panel">
              <h3>账号信息</h3>
              <a-form layout="vertical">
                <a-form-item label="用户名">
                  <a-input v-model:value="userInfo.username" disabled />
                </a-form-item>
                <a-form-item label="邮箱">
                  <a-input v-model:value="userInfo.email" />
                </a-form-item>
                <a-form-item label="手机号">
                  <a-input v-model:value="userInfo.phone" />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary">保存修改</a-button>
                </a-form-item>
              </a-form>
            </div>

            <!-- 订阅管理 -->
            <div v-if="selectedSettingKey.includes('subscription')" class="settings-panel">
              <h3>订阅管理</h3>
              <div class="subscription-status">
                <a-alert
                    :type="userInfo.subscription ? 'success' : 'warning'"
                    :message="userInfo.subscription ? '当前订阅有效' : '您尚未订阅任何套餐'"
                    banner
                />
              </div>

              <div class="subscription-plans">
                <h4>可用套餐</h4>
                <a-radio-group v-model:value="selectedPlan" button-style="solid" class="plan-radio-group">
                  <a-card v-for="plan in subscriptionPlans" :key="plan.id" class="plan-card" :class="{ 'selected-plan': selectedPlan === plan.id }">
                    <template #title>
                      <div class="plan-title">
                        <span>{{ plan.name }}</span>
                        <a-tag :color="plan.tagColor">{{ plan.tag }}</a-tag>
                      </div>
                    </template>
                    <div class="plan-price">¥{{ plan.price }}<span class="price-period">/{{ plan.period }}</span></div>
                    <div class="plan-features">
                      <p v-for="(feature, index) in plan.features" :key="index">
                        <CheckOutlined /> {{ feature }}
                      </p>
                    </div>
                    <a-radio :value="plan.id" class="plan-radio">选择</a-radio>
                  </a-card>
                </a-radio-group>

                <a-button type="primary" size="large" class="subscribe-btn" :disabled="!selectedPlan">
                  {{ userInfo.subscription ? '更改订阅' : '立即订阅' }}
                </a-button>
              </div>
            </div>

            <!-- 使用统计 -->
            <div v-if="selectedSettingKey.includes('usage')" class="settings-panel">
              <h3>使用统计</h3>
              <div class="usage-stats">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-statistic title="本月已生成图片" :value="usageStats.imagesGenerated" />
                  </a-col>
                  <a-col :span="8">
                    <a-statistic title="剩余生成次数" :value="usageStats.imagesRemaining" />
                  </a-col>
                  <a-col :span="8">
                    <a-statistic title="套餐使用率" :value="usageStats.usagePercentage" suffix="%" :precision="2" />
                  </a-col>
                </a-row>

                <div class="usage-progress">
                  <div class="progress-label">套餐使用进度</div>
                  <a-progress :percent="usageStats.usagePercentage" :stroke-color="{ from: '#108ee9', to: '#87d068' }" />
                </div>

                <div class="usage-history">
                  <h4>使用历史</h4>
                  <a-table :dataSource="usageHistory" :columns="usageColumns" :pagination="{ pageSize: 5 }" />
                </div>
              </div>
            </div>

            <!-- 其他设置面板 -->
            <div v-if="selectedSettingKey.includes('appearance')" class="settings-panel">
              <h3>外观设置</h3>
              <p>此功能正在开发中...</p>
            </div>

            <div v-if="selectedSettingKey.includes('notification')" class="settings-panel">
              <h3>通知设置</h3>
              <p>此功能正在开发中...</p>
            </div>

           
          </div>
        </div>
      </a-modal>
    </a-layout>

  </a-layout>
</template>

<script setup lang="ts">
import {
  DownOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  EyeOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  SkinOutlined,
  BellOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  CrownOutlined, // 新增皇冠图标
  // 新增图标
  FileImageOutlined, // 用于文生图
//   PictureOutlined as PictureModeOutlined, // 用于图生图 (避免与生成按钮图标冲突)
 
} from '@ant-design/icons-vue'
import {  Modal } from 'ant-design-vue'; 
// 系统设置相关
const selectedSettingKey = ref(['general']);
const userInfo = reactive({
  username: '',
  email: 'user@example.com',
  phone: '13800138000',
  subscription: null
});
const showDeleteConfirm = () => {
    Modal.confirm({
      title: '您确定要注销账户吗?',
      icon: h(ExclamationCircleOutlined),
      content: '此操作将永久删除您的所有数据，且无法恢复。请再次确认。',
      okText: '确认注销',
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk() {
        console.log('开始执行注销账户逻辑...');
        // 在这里调用后端 API 来删除账户
        // 假设删除成功后的操作：
        message.success('账户已成功注销。');
        localStorage.removeItem("Authorization"); // 清除本地 token
        router.push('/login'); // 跳转到登录页
        open.value = false; // 关闭设置弹窗
      },
      onCancel() {
        console.log('取消注销');
      },
    });
  };
  
// 订阅计划数据
const selectedPlan = ref(null);
const subscriptionPlans = ref([
  {
    id: 'basic',
    name: '基础套餐',
    tag: '入门',
    tagColor: 'blue',
    price: 20,
    period: '月',
    features: [
      '每月100次图像生成',
      '标准分辨率',
      '基础模型访问权限',
      '邮件支持'
    ]
  },
   
  {
    id: 'enterprise',
    name: '企业套餐',
    tag: '高级',
    tagColor: 'purple',
    price: 100,
    period: '月',
    features: [
      '每月2000次图像生成',
      '最高分辨率支持',
      '所有高级功能',
      '专属客户经理',
      'API访问权限',
      '自定义模型训练'
    ]
  }
]);

// 使用统计数据
const usageStats = reactive({
  imagesGenerated: 45,
  imagesRemaining: 55,
  usagePercentage: 45
});

// 使用历史数据
const usageHistory = ref([
  {
    key: '1',
    date: '2023-06-01',
    operation: '图像生成',
    model: 'flux-dev-ultra-fast',
    status: '成功'
  },
  {
    key: '2',
    date: '2023-06-02',
    operation: '图像生成',
    model: 'flux-dev',
    status: '成功'
  },
  {
    key: '3',
    date: '2023-06-03',
    operation: '图像生成',
    model: 'flux-schnell',
    status: '失败'
  },
  {
    key: '4',
    date: '2023-06-04',
    operation: '图像生成',
    model: 'flux-dev-lora',
    status: '成功'
  },
  {
    key: '5',
    date: '2023-06-05',
    operation: '图像生成',
    model: 'flux-dev-ultra-fast',
    status: '成功'
  }
]);

const usageColumns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  },
  {
    title: '使用模型',
    dataIndex: 'model',
    key: 'model',
  },

];



// 更新用户信息
onMounted(() => {
  // ... existing code ...
  // 设置用户信息
  userInfo.username = username.value;
});

// 打开订阅设置
const openSubscriptionSettings = () => {
  open.value = true;
  selectedSettingKey.value = ['subscription'];
};
import {ref, reactive, computed, h} from 'vue'; // 引入 h 用于 Modal icon
import {message} from 'ant-design-vue';
import type {MenuInfo} from 'ant-design-vue/lib/menu/src/interface';
import {useRouter} from 'vue-router';
import {onMounted, onUnmounted} from 'vue';
import {jwtDecode} from 'jwt-decode';
import  type{IApiResponse} from "@/interface/IApiResponse.ts";
import {generatorImg} from '@/api/generator.ts'

// 模型选择
import type { SelectProps } from 'ant-design-vue';
import type {AxiosResponse} from "axios";
const imageOptions = ref<SelectProps['options']>([
  { value: 'flux-dev-lora-ultra-fast', label: 'flux-dev-lora-ultra-fast' },
  { value: 'flux-dev-ultra-fast', label: 'flux-dev-ultra-fast' },
  { value: 'flux-dev', label: 'flux-dev' },
  { value: 'flux-dev-lora', label: 'flux-dev-lora' },
  { value: 'flux-schnell', label: 'flux-schnell' },
  { value: 'flux-schnell-lora', label: 'flux-schnell-lora' },
  { value: 'flux-redux-dev', label: 'flux-redux-dev' },
  { value: 'flux-pro-redux', label: 'flux-pro-redux' },
  { value: 'flux-dev-fill', label: 'flux-dev-fill' },
  { value: 'flux-control-lora-canny', label: 'flux-control-lora-canny' },
]);
const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const imageVal = ref<string | undefined>("flux-dev-ultra-fast");
const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};


const open = ref<boolean>(false);

const router = useRouter()


const username = ref('');

const currentUser = ref({name: ''}); // Keep currentUser if used elsewhere

// --- Other refs and reactive objects ---
const rewrite = ref<boolean>(false)
const params = reactive({
  prompt: '',
  aspectRatio: '1:1',
});
const customWidth = ref<number | null>(1024);
const customHeight = ref<number | null>(1024);
const isLoading = ref<boolean>(false);
const generatedImageUrl = ref<string | null>(null);
 
const previewVisible = ref<boolean>(false);
const isMobile = ref(window.innerWidth < 992);

// --- 侧边栏模式选择 ---
const selectedMode = ref(['text-to-image']); // 默认选中 '文生图'
const generationModes = ref([
  {
    key: 'text-to-image',
    name: '文生图',
    icon: FileImageOutlined
  },
//   {
//     key: 'image-to-image',
//     name: '图生图',
//     icon: PictureModeOutlined
//   },
//   {
//     key: 'text-to-video',
//     name: '文生视频',
//     icon: VideoCameraOutlined
//   }
]);

// --- Computed Properties ---
const isCustomRatioValid = computed(() => {
  return customWidth.value && customHeight.value &&
      customWidth.value > 0 && customHeight.value > 0;
});

// --- Methods ---
const selectPresetSize = (size: string) => {
  const [width, height] = size.split('*').map(Number);
  customWidth.value = width;
  customHeight.value = height;
  params.aspectRatio = size;
  message.success(`已选择预设尺寸: ${width} × ${height}`);
};

const applyCustomRatio = () => {
  if (!isCustomRatioValid.value) {
    message.warning('请输入有效的宽度和高度！');
    return;
  }
  params.aspectRatio = `${customWidth.value}*${customHeight.value}`;
  message.success(`已应用自定义比例 ${customWidth.value} × ${customHeight.value}`);
};

/**
 * 生成图片
 */
const generateImage = async () => {
  if (!params.prompt) {
    message.warning('请输入提示词');
    return;
  }


  try {
    isLoading.value = true;
    const response: AxiosResponse<IApiResponse> = await generatorImg({
      prompt:params.prompt,
      aspectRatio: params.aspectRatio
    });

    const {
      data: {resultValue, successful, resultHint},
    } = response;
    if (!successful)  return  message.error(resultHint);
    generatedImageUrl.value = resultValue;
  } catch (err) {
    console.error("Failed to load data:", err);
    message.error(`error: ${err}`);

  }finally {
    isLoading.value = false
  }


};

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 992;
};

async function rewritePrompt() {
  try {
    rewrite.value = true
    // Mock API call - replace with actual implementation
    // const response: AxiosResponse<IApiResponse> = await promptRewrite({
    //   prompt: params.prompt
    // });
    // const { data } = response;
    // if (data.code === 200) {
    //   params.prompt = data.data.prompt;
    //   message.success('Prompt 已重写');
    // } else {
    //   message.error(data.message || '重写失败');
    // }
    console.log("Rewrite prompt called with:", params.prompt);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async
    params.prompt = "Rewritten: " + params.prompt;
    message.success('Prompt 已模拟重写');

  } catch (err) {
    message.error('重写过程中发生错误');
    console.error(err);
  } finally {
    rewrite.value = false
  }
}


const handleMenuClick = (e: MenuInfo) => {
  if (e.key === 'logout') {
    localStorage.removeItem("Authorization");
    router.push('/login');  

  } else if (e.key === 'settings') {

    open.value = true;
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  const loginfo = localStorage.getItem("Authorization");
  if (loginfo) {
    try {
      const token = jwtDecode(loginfo);
      const nameFromToken = (token as { userName: string }).userName;
      currentUser.value.name = nameFromToken;
      username.value = nameFromToken;
    } catch (e) {
      console.error("Failed to decode token:", e);
      localStorage.removeItem("Authorization");
      router.push('/login');
    }
  } else {
    // Optional: Redirect if not logged in
    router.push('/login');
  }

  window.addEventListener('resize', updateIsMobile);
  updateIsMobile();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});
</script>

<style lang="scss" scoped>
// SCSS变量定义 - 新的配色方案
$primary-color: #3f51b5; // 主色调：靛蓝色
$primary-light: #757de8; // 浅色主色调
$primary-dark: #002984; // 深色主色调
$secondary-color: #ff4081; // 次要色调：粉红色
$secondary-light: #ff79b0;
$secondary-dark: #c60055;
$header-bg: linear-gradient(135deg, $primary-color, $primary-dark);
$header-height: 64px;
$footer-height: 64px;
$content-bg: #f5f7fa; // 浅灰蓝背景
$sider-bg: white;
$card-bg: white;
$text-color: #fff;
$text-dark: rgba(0, 0, 0, 0.85);
$text-secondary: rgba(0, 0, 0, 0.65);
$text-light: rgba(0, 0, 0, 0.45);
$hover-bg: rgba(255, 255, 255, 0.15);
$hover-light-color: #eef2ff;
$border-radius: 4px;
$card-radius: 8px;
$button-radius: 6px;
$card-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
$hover-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;

// 布局样式
.app-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: $header-height;
  background: $header-bg;
  color: $text-color;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dashboard-layout {
  height: calc(100vh - 64px);
  background-color: $content-bg;
  text-align: center;
}

.dashboard-sider {
  background-color: $sider-bg;
  color: $text-dark;
  text-align: left;
  overflow: auto;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  z-index: 5;

  .sider-content {
    padding: $spacing-md;
  }

  .form-card {
    border-radius: $card-radius;
    margin-bottom: $spacing-md;
    box-shadow: $card-shadow;
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: $hover-shadow;
    }

    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      padding: 0 $spacing-md;

      .ant-card-head-title {
        font-weight: 600;
        color: $primary-dark;
      }
    }

    :deep(.ant-card-body) {
      padding: $spacing-md;
    }
  }

  .form-section {
    display: flex;
    flex-direction: column;
  }

  .form-item {
    margin-bottom: $spacing-md;
  }

  .form-label {
    display: block;
    margin-bottom: $spacing-sm;
    font-weight: 500;
    color: $text-dark;
    font-size: 14px;
  }

  .prompt-textarea {
    margin-bottom: $spacing-sm;
    border-radius: $border-radius;

    :deep(.ant-input) {
      &:focus, &:hover {
        border-color: $primary-color;
      }
    }
  }

  .rewrite-btn {
    margin-top: $spacing-sm;
    align-self: flex-end;
    color: white;
    border-color: $primary-color;

    &:hover {
      color: $primary-light;
      border-color: $primary-light;
    }
  }

  .ratio-options {
    margin-bottom: $spacing-md;

    :deep(.ant-tabs-nav::before) {
      border-bottom-color: #f0f0f0;
    }

    :deep(.ant-tabs-tab) {
      &.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: $primary-color;
      }

      &:hover {
        color: $primary-light;
      }
    }

    :deep(.ant-tabs-ink-bar) {
      background-color: $primary-color;
    }

    .ratio-radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
      margin-bottom: $spacing-sm;
      width: 100%;

      :deep(.ant-radio-button-wrapper) {
        margin-bottom: $spacing-sm;
        flex-grow: 1;
        text-align: center;


        &.ant-radio-button-wrapper-checked {
          border-color: $primary-color;


          &::before {
            background-color: $primary-color;
          }
        }
      }
    }

    .preset-size-item {
      cursor: pointer;
      transition: all 0.3s;
      padding: 8px 12px;
      border-radius: 4px;

      &:hover {
        background-color: $hover-light-color;
        transform: translateX(4px);
      }
    }
  }

  :deep(.ant-select){
    width: 100% !important;
  }
  .custom-ratio {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-top: $spacing-sm;

    .ant-input-number {
      width: 100%;
      margin-bottom: $spacing-sm;

      &:focus, &:hover {
        border-color: $primary-color;
      }
    }

    .ant-btn {
      align-self: flex-end;
      background-color: $primary-color;
      border-color: $primary-color;

      &:hover {
        background-color: $primary-light;
        border-color: $primary-light;
      }
    }
  }

  :deep(.ant-divider) {
    border-color: #f0f0f0;
    margin: $spacing-md 0;
  }

  .generate-btn {
    width: 100%;
    height: 45px;
    font-size: 16px;
    margin-top: $spacing-md;
    border-radius: $button-radius;
    background: linear-gradient(45deg, $primary-color, $primary-light);
    border: none;
    transition: all 0.3s ease;
    color: $card-bg;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba($primary-dark, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.dashboard-content {
  min-height: 120px;
  background-color: $content-bg;
  color: $text-dark;
  text-align: center;
  padding: $spacing-lg;
  height: calc(100vh - 120px);
  overflow: hidden;

  .result-container {
    max-width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    :deep(.ant-image) {
      max-height: calc(100% - 70px);
      display: flex;
      justify-content: center;

      .ant-image-img {
        max-height: 100%;
        object-fit: contain;
      }
    }

    .result-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: $border-radius;
      box-shadow: $card-shadow;
    }

    .image-actions {
      margin-top: $spacing-md;
      display: flex;
      gap: $spacing-md;

      :deep(.ant-btn) {
        &[type="primary"] {
          background-color: $primary-color;
          border-color: $primary-color;


          &:hover {
            background-color: $primary-light;
            border-color: $primary-light;
          }
        }

        &:not([type="primary"]) {
          //color: $text-secondary;

          &:hover {
            color: $primary-color;
            border-color: $primary-color;
          }
        }
      }
    }
  }

  .placeholder-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $text-secondary;
    font-size: 16px;

    :deep(.ant-empty) {
      .ant-empty-image {
        opacity: 0.7;
      }

      .ant-empty-description {
        color: $text-light;
      }
    }
  }
}

// 用户区域样式
.user-area {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 $spacing-md;
    position: relative;
    
    .user-dropdown {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 $spacing-sm;
      
      &:hover {
        background-color: $hover-bg;
        border-radius: 4px;
      }
    }
    
    :deep(.anticon) {
      vertical-align: middle;
      font-size: 16px;
      margin-right: 2px;
    }
  }

// 用户下拉菜单触发器样式
.user-dropdown-trigger {
    display: flex;
    align-items: center;
    padding: $spacing-sm $spacing-md;
    border-radius: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
    color: $text-color;
  
    &:hover {
      background-color: $hover-bg;
      
      .dropdown-arrow {
        transform: rotate(180deg);
      }
    }
  
    .user-avatar {
      margin-right: 10px;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
  
    .username {
      font-weight: 500;
      margin: 0 $spacing-sm 0 $spacing-sm;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
  
    .dropdown-arrow {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      transition: transform 0.3s ease;
      margin-left: 4px;
    }
  }

// 下拉菜单样式
.user-dropdown-menu {
  .ant-dropdown-menu-item {
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    .anticon {
      font-size: 16px;
    }

    &:hover {
      background-color: $hover-light-color;
      color: $primary-color;
    }
  }

  .ant-dropdown-menu-item-divider {
    margin: 4px 0;
  }
}
// ... existing code ...

// 设置弹窗样式
// ... existing code ...

// SCSS变量定义 - 增加圆角
$primary-color: #3f51b5; // 主色调：靛蓝色
// ... other variables ...
$border-radius: 6px; // 基础圆角，可以适当增大
$card-radius: 12px; // 卡片圆角，增大
$button-radius: 8px; // 按钮圆角，增大
$danger-color: #f5222d; // 危险色
// ... other variables ...

// 设置弹窗样式
.settings-modal {
     
    
  :deep(.ant-modal-content) {
    
    border-radius: $card-radius; // 使用增大的圆角
    overflow: hidden;
  }

  :deep(.ant-modal-header) {
    background: $header-bg;
    color: $text-color;
    border-bottom: none;
    padding: $spacing-md $spacing-lg;
    // 头部不需要单独设置圆角，因为 content 已经设置了

    .ant-modal-title {
      color: $text-color;
      font-weight: 600;
      font-size: 18px;
    }
  }

  :deep(.ant-modal-body) {
    padding: 0;
  }

  :deep(.ant-modal-footer) {
    border-top: none;
    padding: $spacing-md $spacing-lg;
    // 页脚不需要单独设置圆角
  }
}

.settings-container {
  display: flex;
  height: 500px; // 或者根据内容调整
}

.settings-sidebar {
  width: 200px;
  border-right: 1px solid #f0f0f0;
  background-color: #fafafa;
  // 左侧边栏的圆角由 modal content 控制

  .settings-menu {
    border-right: none;
    padding-top: $spacing-sm; // 增加一点顶部间距
    padding-bottom: $spacing-sm; // 增加一点底部间距

    :deep(.ant-menu-item) {
      margin: $spacing-sm $spacing-sm; // 增加菜单项间距
      border-radius: $button-radius; // 为菜单项增加圆角
      width: calc(100% - #{$spacing-sm * 2}); // 调整宽度以适应 margin

      &.ant-menu-item-selected {
        background-color: $primary-light;
        color: $text-color;

        &::after {
          // border-right-color: $primary-color; // 移除或调整指示器样式
          border-right: none; // 移除右侧指示器，因为背景色已经足够区分
        }
      }

      &:hover {
        color: $primary-color;
        background-color: $hover-light-color; // 增加悬停背景色
      }
    }
  }
}

.settings-content {
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
  // 右侧内容区的圆角由 modal content 控制

  .settings-panel {
    h3 {
      margin-top: 0;
      margin-bottom: $spacing-md;
      color: $primary-dark;
      font-weight: 600;
      font-size: 18px;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: $spacing-sm;
    }

    h4 {
      margin-top: $spacing-lg;
      margin-bottom: $spacing-md;
      color: $text-dark;
      font-weight: 500;
    }

    // 为表单项增加圆角
    :deep(.ant-form-item) {
      .ant-input, .ant-input-number, .ant-select-selector {
        border-radius: $border-radius; // 应用基础圆角
      }
      .ant-input-affix-wrapper {
        border-radius: $border-radius; // 应用基础圆角
      }
      .ant-btn {
        border-radius: $button-radius; // 应用按钮圆角
      }
    }
    .account-management {
        margin-top: $spacing-md;
        padding: $spacing-md;
        background-color: lighten($danger-color, 45%); // 淡红色背景
        border: 1px solid lighten($danger-color, 30%);
        border-radius: $border-radius;
  
        .delete-warning {
          color: $danger-color; // 红色文字
          margin-bottom: $spacing-md;
          font-size: 13px;
        }
      }
  }

  .subscription-status {
    margin-bottom: $spacing-lg;
    :deep(.ant-alert) {
      border-radius: $border-radius; // 为提示框增加圆角
    }
  }

  .subscription-plans {
    .plan-radio-group {
      display: grid; // 改用 Grid 布局，方便控制列数
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); // 响应式列布局
      gap: $spacing-lg; // 增大卡片间距
      margin-bottom: $spacing-lg;
    }

    .plan-card {
      // width: calc(33.33% - #{$spacing-md * 2 / 3}); // 移除固定宽度，由 Grid 控制
      border: 1px solid #e8e8e8; // 默认边框改为浅灰色
      border-radius: $card-radius;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); // 更平滑的过渡效果
      position: relative;
      cursor: pointer;
      overflow: hidden;
      background-color: #fff; // 确保背景色

      :deep(.ant-card-head) {
        // border-top-left-radius: $card-radius; // 移除，让边框统一
        // border-top-right-radius: $card-radius; // 移除
        background-color: #fafafa; // 头部浅灰色背景
        border-bottom: 1px solid #e8e8e8; // 头部底边框
        padding: $spacing-sm $spacing-md; // 调整头部内边距
      }
      :deep(.ant-card-body) {
         padding: $spacing-md;
      }

      &.selected-plan {
        border-color: $primary-color;
        box-shadow: 0 4px 12px rgba($primary-color, 0.15); // 选中时更明显的阴影
        transform: translateY(-2px); // 选中时轻微上浮
        background-color: lighten($primary-light, 35%); // 选中时淡蓝色背景

         :deep(.ant-card-head) {
           background-color: lighten($primary-light, 30%); // 选中时头部背景也变化
           border-bottom-color: lighten($primary-color, 20%);
         }
      }

      &:hover:not(.selected-plan) { // 未选中时的悬停效果
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); // 悬停阴影
        border-color: darken(#e8e8e8, 10%);
      }

      .plan-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          font-weight: 600;
          color: $text-dark; // 标题颜色
        }
        .ant-tag {
            border-radius: $border-radius;
            font-size: 12px; // 调整标签字体大小
            padding: 2px 6px; // 调整标签内边距
        }
      }

      .plan-price {
        font-size: 26px; // 稍微增大价格字体
        font-weight: 700;
        color: $primary-color;
        margin: $spacing-md 0;
        text-align: center; // 价格居中

        .price-period {
          font-size: 13px; // 调整周期字体大小
          color: $text-secondary;
          font-weight: normal;
          margin-left: 4px;
        }
      }

      .plan-features {
        margin-bottom: $spacing-lg + $spacing-md; // 增加底部间距，为 radio 留出空间
        min-height: 100px; // 给特点区域一个最小高度，防止卡片高度不一

        p {
          margin-bottom: $spacing-sm;
          color: $text-secondary;
          font-size: 13px; // 调整特点字体大小
          display: flex; // 使用 flex 对齐图标和文字
          align-items: center;

          :deep(.anticon) {
            color: $primary-color;
            margin-right: $spacing-sm;
            font-size: 14px; // 调整图标大小
          }
        }
      }

      .plan-radio {
        position: absolute;
        bottom: $spacing-md;
        left: 50%; // 水平居中
        transform: translateX(-50%); // 精确居中
        // right: $spacing-md; // 移除右侧定位
        :deep(.ant-radio) { // 隐藏原始 radio 圆圈，因为整个卡片是可选的
            display: none;
        }
         // 可以考虑添加一个视觉上的选中标记，例如在卡片角落加一个勾
         // &::after { ... }
      }
    }

  .usage-stats {
    :deep(.ant-statistic) {
      background-color: #fff;
      padding: $spacing-md;
      border-radius: $border-radius; // 统计卡片圆角
      box-shadow: $card-shadow;
    }
    .usage-progress {
      margin: $spacing-lg 0;

      .progress-label {
        margin-bottom: $spacing-sm;
        font-weight: 500;
      }
      :deep(.ant-progress-inner) {
        border-radius: $button-radius; // 进度条圆角
      }
      :deep(.ant-progress-bg) {
        border-radius: $button-radius; // 进度条圆角
      }
    }

    .usage-history {
      margin-top: $spacing-lg;
      :deep(.ant-table-wrapper) {
        border-radius: $border-radius; // 表格圆角
        overflow: hidden; // 隐藏内部超出部分
      }
      :deep(.ant-table) {
        border-radius: $border-radius;
      }
      :deep(.ant-table-thead > tr > th) {
        background-color: #fafafa; // 表头背景色
      }
      :deep(.ant-pagination) {
        margin-top: $spacing-md;
        padding-right: $spacing-sm; // 分页器右侧留出空间
      }
    }
  }
}
}
 
</style>