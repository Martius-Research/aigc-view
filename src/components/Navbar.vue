<template>
  <div class="navbar">
    <div class="menu-toggle" @click="toggleSidebar">
      <div class="hamburger-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="chat-title">
      {{ currentChat }}
    </div>
    <div class="navbar-actions">
      <button class="action-button">
        <span class="action-icon">🔄</span>
      </button>
      <button class="action-button">
        <span class="action-icon">⚙️</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentChat = ref('时尚服装生成器');
const emit = defineEmits(['toggle-sidebar']);

function toggleSidebar() {
  emit('toggle-sidebar');
}
</script>

<style scoped>
.navbar {
  height: 60px;
  background: linear-gradient(135deg, rgba(52, 53, 65, 0.95), rgba(52, 53, 65, 0.98));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(77, 77, 79, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.menu-toggle {
  display: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.menu-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 20px;
  height: 16px;
}

.hamburger-icon span {
  display: block;
  height: 2px;
  width: 100%;
  background-color: white;
  border-radius: 2px;
  transition: transform 0.3s ease;
}

.chat-title {
  flex: 1;
  text-align: center;
  font-weight: 500;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  opacity: 0.95;
}

.navbar-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  transform: translateY(0);
}

.action-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
}
</style>