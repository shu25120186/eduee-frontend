<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const props = defineProps({
  focusCount: { type: Number, default: 0 },
  selfDiscipline: { type: Number, default: 100 },
  streakDays: { type: Number, default: 0 }
})

const goTo = (path) => router.push(path)

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

// 当前时间
const currentTime = ref(new Date())
const formattedDate = computed(() => {
  const d = currentTime.value
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
})

// 更新时间
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="top-status-bar">
    <!-- 左侧：日期时间 + 用户名 -->
    <div class="date-section">
      <span class="date">{{ formattedDate }}</span>
      <div class="user-info">
        <span class="user-avatar">👤</span>
        <span class="username">{{ userStore.username }}</span>
      </div>
    </div>

    <!-- 中间：核心数据 -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-icon">🍅</span>
        <span class="stat-value">{{ focusCount }}</span>
        <span class="stat-label">今日专注</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-icon">⚡</span>
        <span class="stat-value">{{ selfDiscipline }}</span>
        <span class="stat-label">自律值</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-icon">🔥</span>
        <span class="stat-value">{{ streakDays }}</span>
        <span class="stat-label">连续天数</span>
      </div>
    </div>

    <!-- 右侧：导航按钮 -->
    <div class="actions-section">
      <button class="action-btn exam" title="英语模考" @click="goTo('/exam')">📝</button>
      <button class="action-btn pk" title="PK挑战" @click="goTo('/pk')">⚔️</button>
      <button class="action-btn" title="AI助手" @click="goTo('/ai')">🤖</button>
      <button class="action-btn" title="学习计划" @click="goTo('/plans')">📚</button>
      <button class="action-btn" title="数据看板" @click="goTo('/dashboard')">📊</button>
      <button class="action-btn" title="排行榜" @click="goTo('/leaderboard')">🏆</button>
      <button class="action-btn" title="成就墙" @click="goTo('/achievements')">🎖️</button>
      <button class="action-btn" title="好友" @click="goTo('/friends')">👥</button>
      <button class="action-btn" title="商店" @click="goTo('/shop')">🛒</button>
      <button class="action-btn" title="活动 & 签到" @click="goTo('/events')">🎉</button>
      <button class="action-btn logout" title="退出登录" @click="logout">🚪</button>
    </div>
  </div>
</template>

<style scoped>
.top-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  z-index: 999 !important;
  pointer-events: auto !important;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.date-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.user-avatar {
  font-size: 14px;
}

.username {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
  min-width: 24px;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
}

.actions-section {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-btn.exam {
  background: rgba(251, 191, 36, 0.25);
  border-color: rgba(251, 191, 36, 0.4);
}

.action-btn.pk {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.4);
}

.action-btn.logout {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.3);
}

.action-btn.logout:hover {
  background: rgba(248, 113, 113, 0.35);
}

/* 响应式设计 - 平板 */
@media (max-width: 1023px) {
  .top-status-bar {
    padding: 0 16px;
  }

  .stat-label {
    display: none;
  }

  .stats-section {
    gap: 16px;
  }

  .actions-section {
    gap: 4px;
  }

  .action-btn {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }

  /* 隐藏部分按钮 */
  .action-btn:nth-child(n+7) {
    display: none;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 767px) {
  .top-status-bar {
    padding: 0 12px;
    height: 52px;
  }

  .date {
    display: none;
  }

  .date-section {
    gap: 12px;
  }

  .user-info {
    padding: 4px 10px;
  }

  .username {
    font-size: 12px;
  }

  .stats-section {
    gap: 12px;
  }

  .stat-icon {
    font-size: 16px;
  }

  .stat-value {
    font-size: 16px;
    min-width: 20px;
  }

  .stat-divider {
    height: 20px;
  }

  /* 移动端只显示核心按钮 */
  .actions-section {
    display: none;
  }
}
</style>
