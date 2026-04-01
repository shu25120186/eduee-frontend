<script setup>
import { ref } from 'vue'

const props = defineProps({
  formattedTime: { type: String, default: '25:00' },
  isRunning: { type: Boolean, default: false },
  focusProgress: { type: Number, default: 0 },
  durationOptions: { type: Array, default: () => [15, 25, 30, 45, 60] },
  selectedDuration: { type: Number, default: 25 },
  todayGoals: { type: Array, default: () => [] },
  userGrowth: {
    type: Object,
    default: () => ({
      exp: 0,
      level: 1,
      discipline_score: 50,
      streak_days: 0,
      total_focus_minutes: 0
    })
  }
})

const emit = defineEmits(['start-focus', 'change-duration', 'add-goal', 'toggle-goal'])

// 面板展开状态
const showGoalsPanel = ref(false)

// 新任务输入
const newGoalText = ref('')
const isAddingGoal = ref(false)

// 添加任务
const addGoal = () => {
  if (newGoalText.value.trim()) {
    emit('add-goal', newGoalText.value.trim())
    newGoalText.value = ''
    isAddingGoal.value = false
  }
}

// 切换任务完成状态
const toggleGoal = (goalId) => {
  emit('toggle-goal', goalId)
}
</script>

<template>
  <div class="left-sidebar">
    <!-- 🍅 番茄钟模块 -->
    <div class="sidebar-card pomodoro-card">
      <div class="card-header">
        <span class="card-icon">🍅</span>
        <span class="card-title">专注时钟</span>
      </div>

      <!-- 时长选择 -->
      <div class="duration-pills">
        <button
          v-for="min in durationOptions"
          :key="min"
          :class="['pill', { active: selectedDuration === min }]"
          :disabled="isRunning"
          @click="emit('change-duration', min)"
        >
          {{ min }}
        </button>
      </div>

      <!-- 倒计时 -->
      <div class="time-display">{{ formattedTime }}</div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${focusProgress * 100}%` }"></div>
      </div>

      <!-- 开始按钮 -->
      <button
        class="start-btn"
        :class="{ running: isRunning }"
        :disabled="isRunning"
        @click="emit('start-focus')"
      >
        {{ isRunning ? '专注中...' : '开始专注' }}
      </button>
    </div>

    <!-- 📋 今日目标模块 -->
    <div class="sidebar-card goals-card">
      <div class="card-header clickable" @click="showGoalsPanel = !showGoalsPanel">
        <span class="card-icon">📋</span>
        <span class="card-title">今日目标</span>
        <span class="card-badge" v-if="todayGoals.length">{{ todayGoals.filter(g => g.done).length }}/{{ todayGoals.length }}</span>
        <span class="expand-icon" :class="{ expanded: showGoalsPanel }">▼</span>
      </div>

      <!-- 目标列表 -->
      <div v-if="showGoalsPanel" class="goals-list">
        <!-- 添加任务输入框 -->
        <div class="add-goal-row">
          <input
            v-if="isAddingGoal"
            v-model="newGoalText"
            type="text"
            class="goal-input"
            placeholder="输入任务内容..."
            @keyup.enter="addGoal"
            @blur="isAddingGoal = false"
            ref="goalInputRef"
          />
          <button
            v-else
            class="add-goal-btn"
            @click.stop="isAddingGoal = true"
          >
            + 添加任务
          </button>
          <button
            v-if="isAddingGoal"
            class="confirm-btn"
            @click.stop="addGoal"
          >
            ✓
          </button>
        </div>

        <!-- 任务列表 -->
        <div
          v-for="goal in todayGoals"
          :key="goal.id"
          :class="['goal-item', { done: goal.done }]"
          @click="toggleGoal(goal.id)"
        >
          <span class="goal-check">{{ goal.done ? '✅' : '⭕' }}</span>
          <span class="goal-text">{{ goal.text }}</span>
        </div>

        <div v-if="todayGoals.length === 0 && !isAddingGoal" class="empty-goals">
          点击上方按钮添加任务
        </div>
      </div>
    </div>

    <!-- 💡 学习状态 -->
    <div class="sidebar-card status-card">
      <div class="card-header">
        <span class="card-icon">💡</span>
        <span class="card-title">今日状态</span>
      </div>
      <div class="status-content">
        <div class="status-item">
          <span class="status-label">专注时长</span>
          <span class="status-value">{{ Math.floor((userGrowth.total_focus_minutes || 0) / 60) }}小时{{ (userGrowth.total_focus_minutes || 0) % 60 }}分钟</span>
        </div>
        <div class="status-item">
          <span class="status-label">自律指数</span>
          <span class="status-value" :class="{ good: userGrowth.discipline_score >= 70, warning: userGrowth.discipline_score < 50 }">
            {{ Math.round(userGrowth.discipline_score || 50) }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">等级</span>
          <span class="status-value level">Lv.{{ userGrowth.level || 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-sidebar {
  position: fixed;
  left: 20px;
  top: 80px;
  width: 260px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 999 !important;
  pointer-events: auto !important;

  display: flex;
  flex-direction: column;
  gap: 16px;

  /* 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.left-sidebar::-webkit-scrollbar {
  width: 4px;
}

.left-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.left-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

/* 卡片通用样式 */
.sidebar-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.card-header.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.card-header.clickable:hover {
  opacity: 0.8;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: white;
  flex: 1;
}

.card-badge {
  background: rgba(74, 222, 128, 0.3);
  color: #4ade80;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.expand-icon {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 时长选择 */
.duration-pills {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.pill {
  flex: 1;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.pill:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.pill.active {
  background: rgba(74, 222, 128, 0.3);
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.5);
}

.pill:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 倒计时 */
.time-display {
  font-size: 48px;
  font-weight: 800;
  color: white;
  text-align: center;
  letter-spacing: 2px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
}

/* 进度条 */
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22d3ee);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 开始按钮 */
.start-btn {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: rgba(74, 222, 128, 0.25);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
}

.start-btn:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.3);
}

.start-btn.running {
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.3);
}

.start-btn:disabled {
  cursor: not-allowed;
}

/* 目标列表 */
.goals-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  color: white;
}

.goal-item.done .goal-text {
  text-decoration: line-through;
  opacity: 0.5;
}

.goal-check {
  font-size: 14px;
}

.goal-text {
  font-size: 14px;
  flex: 1;
}

.empty-goals {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  padding: 20px 0;
}

/* 添加任务 */
.add-goal-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.goal-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
}

.goal-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.goal-input:focus {
  border-color: rgba(74, 222, 128, 0.5);
  background: rgba(255, 255, 255, 0.2);
}

.add-goal-btn {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-goal-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-style: solid;
}

.confirm-btn {
  padding: 10px 14px;
  font-size: 16px;
  color: white;
  background: rgba(74, 222, 128, 0.3);
  border: 1px solid rgba(74, 222, 128, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: rgba(74, 222, 128, 0.5);
}

.goal-item {
  cursor: pointer;
  transition: all 0.2s;
}

.goal-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin: 0 -8px;
  padding: 10px 8px;
}

/* 状态内容 */
.status-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.status-value.good {
  color: #4ade80;
}

.status-value.warning {
  color: #f59e0b;
}

.status-value.level {
  color: #a78bfa;
  font-weight: 700;
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .left-sidebar {
    left: 12px;
    width: 240px;
    top: 70px;
    max-height: calc(100vh - 90px);
  }

  .time-display {
    font-size: 40px;
  }

  .sidebar-card {
    padding: 16px;
  }
}

@media (max-width: 767px) {
  .left-sidebar {
    display: none; /* 移动端隐藏，通过浮动按钮触发 */
  }
}
</style>
