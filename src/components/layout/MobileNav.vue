<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 菜单展开状态
const isMenuOpen = ref(false)

// 主导航项
const mainNavItems = [
  { path: '/', icon: '🏝️', label: '岛屿' },
  { path: '/ai', icon: '🤖', label: 'AI' },
  { path: '/dashboard', icon: '📊', label: '数据' },
  { path: '/plans', icon: '📚', label: '计划' }
]

// 更多菜单项
const moreMenuItems = [
  { path: '/exam', icon: '📝', label: '英语模考' },
  { path: '/pk', icon: '⚔️', label: 'PK挑战' },
  { path: '/leaderboard', icon: '🏆', label: '排行榜' },
  { path: '/achievements', icon: '🎖️', label: '成就墙' },
  { path: '/friends', icon: '👥', label: '好友' },
  { path: '/shop', icon: '🛒', label: '商店' },
  { path: '/events', icon: '🎉', label: '活动' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const navigate = (path) => {
  router.push(path)
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 关闭菜单当点击外部
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <!-- 移动端底部导航栏 -->
  <nav class="mobile-nav">
    <!-- 主导航项 -->
    <button
      v-for="item in mainNavItems"
      :key="item.path"
      :class="['nav-item', { active: isActive(item.path) }]"
      @click="navigate(item.path)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </button>

    <!-- 更多按钮 -->
    <button :class="['nav-item', { active: isMenuOpen }]" @click="toggleMenu">
      <span class="nav-icon">{{ isMenuOpen ? '✕' : '☰' }}</span>
      <span class="nav-label">{{ isMenuOpen ? '关闭' : '更多' }}</span>
    </button>
  </nav>

  <!-- 更多菜单遮罩 -->
  <Transition name="fade">
    <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu" />
  </Transition>

  <!-- 更多菜单面板 -->
  <Transition name="slide-up">
    <div v-if="isMenuOpen" class="more-menu">
      <div class="menu-grid">
        <button
          v-for="item in moreMenuItems"
          :key="item.path"
          :class="['menu-item', { active: isActive(item.path) }]"
          @click="navigate(item.path)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 移动端底部导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--mobile-nav-height, 64px);
  background: rgba(15, 15, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: var(--z-sidebar, 500);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all var(--duration-fast, 150ms) var(--ease-out);
  border-radius: 12px;
  min-width: 60px;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item.active {
  color: var(--color-primary-400, #4ade80);
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-icon {
  font-size: 22px;
  transition: transform var(--duration-fast, 150ms);
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

/* 遮罩层 */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-sidebar, 500) - 1);
}

/* 更多菜单面板 */
.more-menu {
  position: fixed;
  bottom: var(--mobile-nav-height, 64px);
  left: 0;
  right: 0;
  background: rgba(20, 20, 40, 0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px 24px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
  z-index: var(--z-sidebar, 500);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all var(--duration-fast, 150ms);
}

.menu-item:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.15);
}

.menu-item.active {
  background: rgba(74, 222, 128, 0.2);
  border-color: rgba(74, 222, 128, 0.3);
  color: var(--color-primary-400, #4ade80);
}

.menu-icon {
  font-size: 26px;
}

.menu-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal, 250ms);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform var(--duration-slow, 400ms) var(--ease-out);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* 响应式 - 只在移动端显示 */
@media (min-width: 768px) {
  .mobile-nav,
  .menu-overlay,
  .more-menu {
    display: none;
  }
}
</style>
