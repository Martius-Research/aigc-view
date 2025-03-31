<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>ClothesGPT</h1>
    </div>
    <div class="new-chat" @click="startNewChat">
      <span class="plus-icon">+</span>
      <span>新对话</span>
    </div>
    <div class="chat-history-list">
      <div v-for="(chat, index) in chatHistory" :key="index" class="chat-item" :class="{ 'active': activeChatIndex === index }" @click="selectChat(index)">
        <span class="chat-icon">💬</span>
        <span class="chat-title">{{ chat.title }}</span>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="user-info">
        <span class="user-avatar">👤</span>
        <span class="user-name">用户</span>
        <div class="settings-dropdown" :class="{ 'active': isSettingsOpen }">
          <button class="settings-button" @click="toggleSettings">
            <span class="settings-icon">⚙️</span>
          </button>
          <div class="dropdown-menu" v-if="isSettingsOpen">
            <div class="menu-item" @click="handleUserSettings">
              <span class="item-icon">👤</span>
              <span>用户设置</span>
            </div>
            <div class="menu-item" @click="handleThemeToggle">
              <span class="item-icon">🎨</span>
              <span>主题切换</span>
            </div>
            <div class="menu-item" @click="handleLanguage">
              <span class="item-icon">🌐</span>
              <span>语言选择</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const chatHistory = ref([
  { title: '时尚夏装设计' },
  { title: '冬季外套搭配' },
  { title: '商务正装推荐' }
]);

const activeChatIndex = ref(0);
const isSettingsOpen = ref(false);

function startNewChat() {
  chatHistory.value.unshift({ title: '新对话' });
  activeChatIndex.value = 0;
}

function selectChat(index: number) {
  activeChatIndex.value = index;
}

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value;
}

function handleUserSettings() {
  console.log('用户设置');
  isSettingsOpen.value = false;
}

function handleThemeToggle() {
  console.log('主题切换');
  isSettingsOpen.value = false;
}

function handleLanguage() {
  console.log('语言选择');
  isSettingsOpen.value = false;
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #24243e 100%);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
}

.sidebar-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #4d4d4f;
}

.sidebar-header h1 {
  font-size: 20px;
  margin: 0;
}

.new-chat {
  margin: 16px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.1), rgba(16, 163, 127, 0.2));
  border: 1px solid rgba(16, 163, 127, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.new-chat:hover {
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.2), rgba(16, 163, 127, 0.3));
  transform: translateY(-2px);
}

.new-chat:hover {
  background-color: #2b2c2f;
}

.plus-icon {
  margin-right: 8px;
  font-weight: bold;
}

.chat-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.chat-item:hover {
  background-color: #2b2c2f;
}

.chat-item.active {
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.1), rgba(16, 163, 127, 0.2));
  border: 1px solid rgba(16, 163, 127, 0.3);
}

.chat-icon {
  margin-right: 8px;
}

.chat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #4d4d4f;
}

.user-info {
  display: flex;
  align-items: center;
  position: relative;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.2), rgba(16, 163, 127, 0.3));
  border-radius: 50%;
  margin-right: 12px;
  font-size: 20px;
  transition: all 0.3s ease;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.settings-dropdown {
  margin-left: auto;
  position: relative;
}

.settings-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.settings-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.settings-dropdown.active .settings-button {
  background: rgba(255, 255, 255, 0.1);
}

.settings-dropdown.active .dropdown-menu {
  display: block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 160px;
  background: linear-gradient(135deg, #1a1a2e 0%, #24243e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 0;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.2s ease-out;
}

.menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.item-icon {
  margin-right: 8px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>