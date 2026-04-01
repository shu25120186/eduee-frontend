<script setup>
import { ref } from 'vue'

const props = defineProps({
  recentAchievement: { type: Object, default: null },
  communityUpdates: { type: Array, default: () => [] }
})

const emit = defineEmits(['view-community', 'dismiss-achievement'])

// 滚动消息
const messages = ref([
  '🌱 完成今日第一个专注，获得成长值 +10',
  '📚 系统提示：模拟考试功能已上线',
  '🎉 恭喜！你获得了「初级自律者」徽章'
])

const currentMessageIndex = ref(0)

const nextMessage = () => {
  currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.value.length
}
</script>

<template>
  <div class="bottom-info-bar">
    <!-- 滚动消息 -->
    <div class="message-roller" @click="nextMessage">
      <span class="message-icon">💡</span>
      <span class="message-text">{{ messages[currentMessageIndex] }}</span>
      <span class="message-nav">●●●</span>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <button class="quick-btn" title="社区广场">
        <span>🏘️</span>
        <span class="btn-label">社区</span>
      </button>
      <button class="quick-btn" title="成就墙">
        <span>🏆</span>
        <span class="btn-label">成就</span>
      </button>
      <button class="quick-btn" title="数据统计">
        <span>📊</span>
        <span class="btn-label">统计</span>
      </button>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
      EduEE 伏特自律岛 · 学习使我快乐
    </div>
  </div>
</template>

<style scoped>
.bottom-info-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  z-index: 999 !important;
  pointer-events: auto !important;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 滚动消息 */
.message-roller {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.message-roller:hover {
  background: rgba(255, 255, 255, 0.15);
}

.message-icon {
  font-size: 14px;
}

.message-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-nav {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  gap: 8px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-label {
  font-size: 12px;
  opacity: 0.8;
}

/* 版权信息 */
.copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* 响应式设计 - 平板 */
@media (max-width: 1023px) {
  .bottom-info-bar {
    padding: 0 16px;
  }

  .message-text {
    max-width: 200px;
  }

  .quick-btn {
    padding: 6px 10px;
  }

  .btn-label {
    display: none;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 767px) {
  /* 移动端隐藏底部栏，用 MobileNav 替代 */
  .bottom-info-bar {
    display: none;
  }
}
</style>
