<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import gsap from 'gsap'

// 布局组件
import TopStatusBar from './TopStatusBar.vue'
import LeftSidebar from './LeftSidebar.vue'
import BottomInfoBar from './BottomInfoBar.vue'
import PhoneUsageReport from './PhoneUsageReport.vue'
import Inventory from './Inventory.vue'
import MobileNav from './layout/MobileNav.vue'

// 3D 组件
import FloatingIsland from './FloatingIsland.vue'

// 路由
const router = useRouter()

// ============================================
// 👤 用户状态
// ============================================
const currentUsername = ref(localStorage.getItem('username') || 'guest')
const inventoryRef = ref(null)

// 道具掉落提示
const dropNotification = ref(null)

// ============================================
// 📋 今日目标/任务列表
// ============================================
const todayGoals = ref([
  { id: 1, text: '完成电路分析作业', done: false },
  { id: 2, text: '复习模拟电子技术', done: false },
  { id: 3, text: '整理课堂笔记', done: true }
])
let goalIdCounter = 4

// 添加任务
const addGoal = (text) => {
  todayGoals.value.push({
    id: goalIdCounter++,
    text: text,
    done: false
  })
  console.log('添加任务:', text)
}

// 切换任务完成状态
const toggleGoal = (goalId) => {
  const goal = todayGoals.value.find(g => g.id === goalId)
  if (goal) {
    goal.done = !goal.done
    if (goal.done) {
      console.log('完成任务:', goal.text)
      // TODO: 触发道具掉落检查
    }
  }
}

// ============================================
// 🍅 番茄钟核心逻辑
// ============================================
// 可选时长（分钟）
const durationOptions = [15, 25, 30, 45, 60]
const selectedDuration = ref(25) // 默认25分钟

// 计算总秒数
const totalSeconds = computed(() => selectedDuration.value * 60)
const remainingSeconds = ref(totalSeconds.value)
const isRunning = ref(false)
const isSubmitting = ref(false)
let timer = null

// 切换时长
const changeDuration = (minutes) => {
  if (isRunning.value) return // 专注中不允许切换
  selectedDuration.value = minutes
  remainingSeconds.value = minutes * 60
}

// 格式化时间显示 (MM:SS)
const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

// 计算当前专注进度 (0 = 开始, 1 = 完成)
const focusProgress = computed(() => {
  return 1 - (remainingSeconds.value / totalSeconds.value)
})

// ============================================
// 🌅 日夜交替系统
// ============================================
const dayColors = {
  sky: '#87CEEB',
  ambient: '#ffffff',
  ambientIntensity: 1.5,
  directional: '#fffaf0',
  directionalIntensity: 2.5
}

const sunsetColors = {
  sky: '#FF6B35',
  ambient: '#ffaa66',
  ambientIntensity: 1.0,
  directional: '#ff4444',
  directionalIntensity: 1.8
}

const nightColors = {
  sky: '#0f1b2e',
  ambient: '#3366aa',
  ambientIntensity: 0.4,
  directional: '#6699ff',
  directionalIntensity: 0.6
}

// 颜色插值
const lerpColor = (color1, color2, t) => {
  const hex2rgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  const rgb2hex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }
  const c1 = hex2rgb(color1)
  const c2 = hex2rgb(color2)
  if (!c1 || !c2) return color1
  return rgb2hex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  )
}

const sceneColors = computed(() => {
  const progress = focusProgress.value
  let from, to, localT
  if (progress < 0.5) {
    from = dayColors
    to = sunsetColors
    localT = progress * 2
  } else {
    from = sunsetColors
    to = nightColors
    localT = (progress - 0.5) * 2
  }
  return {
    sky: lerpColor(from.sky, to.sky, localT),
    ambient: lerpColor(from.ambient, to.ambient, localT),
    ambientIntensity: from.ambientIntensity + (to.ambientIntensity - from.ambientIntensity) * localT,
    directional: lerpColor(from.directional, to.directional, localT),
    directionalIntensity: from.directionalIntensity + (to.directionalIntensity - from.directionalIntensity) * localT
  }
})

// ============================================
// 🌲 种树动画
// ============================================
const plantedTrees = ref([])
let treeIdCounter = 0

const generateTreePosition = () => {
  const angle = Math.random() * Math.PI * 2
  const radius = 1.5 + Math.random() * 2
  return {
    x: Math.cos(angle) * radius,
    y: 0.1,
    z: Math.sin(angle) * radius
  }
}

const plantTree = () => {
  const pos = generateTreePosition()
  const treeId = treeIdCounter++
  const newTree = {
    id: treeId,
    position: [pos.x, pos.y, pos.z],
    scale: [0, 0, 0],
    color: `hsl(${120 + Math.random() * 20}, ${60 + Math.random() * 20}%, ${35 + Math.random() * 15}%)`
  }
  plantedTrees.value.push(newTree)
  setTimeout(() => {
    gsap.to(newTree, {
      scale: [1, 1, 1],
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)',
      onUpdate: () => {
        plantedTrees.value = [...plantedTrees.value]
      }
    })
  }, 50)
  triggerCelebrationLight(pos)
}

// ============================================
// ✨ 庆祝光芒特效
// ============================================
const celebrationLights = ref([])

const triggerCelebrationLight = (position) => {
  const lightId = Date.now()
  const light = {
    id: lightId,
    position: [position.x, position.y + 1.5, position.z],
    intensity: 0,
    color: '#ffdd44',
    distance: 8,
    decay: 2
  }
  celebrationLights.value.push(light)
  const timeline = gsap.timeline()
  timeline.to(light, {
    intensity: 5,
    duration: 0.3,
    ease: 'power2.out',
    onUpdate: () => {
      celebrationLights.value = [...celebrationLights.value]
    }
  })
  timeline.to(light, {
    intensity: 0,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: () => {
      celebrationLights.value = [...celebrationLights.value]
    },
    onComplete: () => {
      celebrationLights.value = celebrationLights.value.filter(l => l.id !== lightId)
    }
  })
}

// ============================================
// 📤 数据提交
// ============================================
const userGrowth = ref({
  exp: 0,
  level: 1,
  streak_days: 0,
  discipline_score: 50
})

// 加载用户成长数据
const loadUserGrowth = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/growth/${currentUsername.value}`)
    if (response.data.growth) {
      userGrowth.value = response.data.growth
    }
  } catch (error) {
    console.error('加载成长数据失败:', error.message)
  }
}

const submitFocusComplete = async () => {
  isSubmitting.value = true
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/focus/complete', {
      username: currentUsername.value,
      duration: selectedDuration.value,
      subject: '电气工程'
    })
    console.log('专注记录已同步:', response.data)

    // 更新成长数据
    if (response.data.new_level) {
      userGrowth.value.level = response.data.new_level
      userGrowth.value.exp = response.data.new_exp
    }
    if (response.data.streak_days) {
      userGrowth.value.streak_days = response.data.streak_days
    }

    // 升级提示
    if (response.data.level_up) {
      console.log(`🎉 升级了！当前等级: ${response.data.new_level}`)
    }

    // 检查道具掉落
    if (response.data.bonus_item) {
      showDropNotification(response.data.bonus_item)
      // 刷新背包
      if (inventoryRef.value) {
        inventoryRef.value.loadInventory()
      }
    }
  } catch (error) {
    console.error('同步专注记录失败:', error.message)
  } finally {
    isSubmitting.value = false
  }
}

// 🎁 道具掉落通知
const showDropNotification = (item) => {
  dropNotification.value = item
  setTimeout(() => {
    dropNotification.value = null
  }, 3000)
}

// 📱 手机上报成功回调
const onPhoneUsageReported = () => {
  console.log('手机使用已上报')
}

// 🎁 道具使用回调
const onItemUsed = (item) => {
  console.log('使用了道具:', item.name)
  // TODO: 应用道具效果
}

// 🎬 开始专注计时
const startFocus = () => {
  if (isRunning.value) return
  isRunning.value = true
  timer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timer)
      timer = null
      isRunning.value = false
      console.log('🎉 专注完成！')
      plantTree()
      remainingSeconds.value = totalSeconds.value
      submitFocusComplete()
    }
  }, 1000)
}

onMounted(() => {
  loadUserGrowth()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <!-- 🏠 根容器 - 三明治结构 -->
  <div class="island-world-container">

    <!-- 🎨 第1层：3D 画布（z-index: 0，底层背景，pointer-events: none 让点击穿透） -->
    <div class="canvas-layer">
      <TresCanvas :clear-color="sceneColors.sky" window-size :shadows="false">
        <!-- 摄像机 - 斜视岛屿，更像游戏视角 -->
        <TresPerspectiveCamera :position="[8, 6, 8]" :look-at="[0, 0, 0]" />
        <OrbitControls
          :enable-damping="true"
          :damping-factor="0.05"
          :min-distance="5"
          :max-distance="20"
          :max-polar-angle="Math.PI / 2.2"
        />

        <!-- 环境光 - 柔和的全局光 -->
        <TresAmbientLight
          :color="sceneColors.ambient"
          :intensity="sceneColors.ambientIntensity"
        />

        <!-- 平行光 - 模拟太阳 -->
        <TresDirectionalLight
          :position="[5, 10, 5]"
          :color="sceneColors.directional"
          :intensity="sceneColors.directionalIntensity"
        />

        <!-- 🌊 海平面 - 半透明蓝色水面 -->
        <TresMesh :position="[0, -2.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
          <TresPlaneGeometry :args="[50, 50]" />
          <TresMeshStandardMaterial
            color="#4fc3f7"
            :transparent="true"
            :opacity="0.6"
          />
        </TresMesh>

        <!-- ☁️ 云朵 1 -->
        <TresMesh :position="[-6, 4, -4]" :scale="[2, 0.8, 1.5]">
          <TresSphereGeometry :args="[1, 8, 8]" />
          <TresMeshStandardMaterial color="#ffffff" />
        </TresMesh>

        <!-- ☁️ 云朵 2 -->
        <TresMesh :position="[5, 3.5, -6]" :scale="[1.5, 0.6, 1]">
          <TresSphereGeometry :args="[1, 8, 8]" />
          <TresMeshStandardMaterial color="#ffffff" />
        </TresMesh>

        <!-- ☁️ 云朵 3 -->
        <TresMesh :position="[8, 4.5, 3]" :scale="[1.8, 0.7, 1.2]">
          <TresSphereGeometry :args="[1, 8, 8]" />
          <TresMeshStandardMaterial color="#ffffff" />
        </TresMesh>

        <!-- 🏝️ 漂浮岛屿 -->
        <FloatingIsland />

        <!-- 🌲 动态种植的树木 -->
        <TresGroup v-for="tree in plantedTrees" :key="tree.id">
          <TresMesh :position="tree.position" :scale="tree.scale">
            <TresCylinderGeometry :args="[0.05, 0.08, 0.4, 8]" />
            <TresMeshStandardMaterial color="#8B4513" />
          </TresMesh>
          <TresMesh
            :position="[tree.position[0], tree.position[1] + 0.5, tree.position[2]]"
            :scale="tree.scale"
          >
            <TresConeGeometry :args="[0.3, 0.5, 8]" />
            <TresMeshStandardMaterial :color="tree.color" />
          </TresMesh>
        </TresGroup>

        <!-- ✨ 庆祝光芒 -->
        <TresPointLight
          v-for="light in celebrationLights"
          :key="light.id"
          :position="light.position"
          :intensity="light.intensity"
          :color="light.color"
          :distance="light.distance"
          :decay="light.decay"
        />
      </TresCanvas>
    </div>

    <!-- 🍅 第2层：番茄钟 UI（z-index: 10，顶部居中）- 已移除，改用左侧栏 -->

    <!-- 📱 第2.5层：顶部状态栏 -->
    <TopStatusBar
      :focus-count="plantedTrees.length"
      :self-discipline="userGrowth.discipline_score"
      :streak-days="userGrowth.streak_days"
    />

    <!-- 📋 第3层：左侧功能栏 -->
    <LeftSidebar
      :formatted-time="formattedTime"
      :is-running="isRunning"
      :focus-progress="focusProgress"
      :duration-options="durationOptions"
      :selected-duration="selectedDuration"
      :today-goals="todayGoals"
      :user-growth="userGrowth"
      @start-focus="startFocus"
      @change-duration="changeDuration"
      @add-goal="addGoal"
      @toggle-goal="toggleGoal"
    />

    <!-- 📱 第4层：右侧侧边栏（z-index: 999，垂直居中，上下排列） -->
    <div class="right-sidebar" style="position: fixed !important; top: 50% !important; right: 20px !important; transform: translateY(-50%) !important; z-index: 99999 !important; display: flex !important; flex-direction: column !important; gap: 16px !important;">
      <PhoneUsageReport
        :username="currentUsername"
        @reported="onPhoneUsageReported"
      />
      <Inventory
        ref="inventoryRef"
        :username="currentUsername"
        @item-used="onItemUsed"
      />
    </div>

    <!-- 📊 第5层：底部信息栏 -->
    <BottomInfoBar
      :recent-achievement="null"
      :community-updates="[]"
    />

    <!-- 🎁 第4层：道具掉落通知（z-index: 100，屏幕中央） -->
    <div v-if="dropNotification" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); border: 2px solid rgba(255, 215, 0, 0.5); border-radius: 20px; padding: 24px 40px; display: flex; align-items: center; gap: 12px; z-index: 100; animation: dropIn 0.5s ease;">
      <span style="font-size: 32px;">🎉</span>
      <span style="color: white; font-size: 18px; font-weight: 600;">获得 {{ dropNotification.name }}！</span>
      <span :class="'drop-rarity ' + dropNotification.rarity" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">{{ dropNotification.rarity }}</span>
    </div>

    <!-- 🤖 AI助手悬浮按钮 -->
    <button class="ai-float-btn" @click="router.push('/ai')" title="AI学习助手">
      🤖
    </button>

    <!-- 📱 移动端底部导航 -->
    <MobileNav />

    <!-- 🍅 移动端专注悬浮按钮 -->
    <button
      v-if="!isRunning"
      class="mobile-focus-btn"
      @click="startFocus"
      title="开始专注"
    >
      🍅
    </button>

  </div>
</template>

<style scoped>
/* 🏝️ 岛屿世界容器 */
.island-world-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #87CEEB 0%, #b8e4f0 50%, #d4f1f9 100%);
}

/* 🎨 Canvas 层 - 底层 */
.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto;
}

/* 让 Canvas 内部可以交互，但不阻挡 UI */
.canvas-layer :deep(canvas) {
  pointer-events: auto;
}

/* 🖱️ UI 层通用样式 - 确保可点击 */
.ui-layer {
  pointer-events: auto;
  z-index: 999;
}

/* 📱 右侧侧边栏 - 强制最高层级和可点击 */
.right-sidebar {
  position: absolute !important;
  top: 50% !important;
  right: 20px !important;
  transform: translateY(-50%) !important;
  z-index: 9999 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  align-items: flex-end !important;
  pointer-events: auto !important;
}

/* 确保子组件可点击 */
.right-sidebar :deep(*) {
  pointer-events: auto !important;
}

/* 🎁 道具稀有度颜色 */
.drop-rarity.common { background: #6b7280; color: white; }
.drop-rarity.rare { background: #3b82f6; color: white; }
.drop-rarity.epic { background: #a855f7; color: white; }
.drop-rarity.legendary { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; }

/* 动画 */
@keyframes dropIn {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 🤖 AI悬浮按钮 */
.ai-float-btn {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8));
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  transition: all 0.3s;
  animation: float 3s ease-in-out infinite;
}

.ai-float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.6);
}

/* 🍅 移动端专注按钮 */
.mobile-focus-btn {
  display: none;
  position: fixed;
  bottom: calc(var(--mobile-nav-height, 64px) + 80px);
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.8), rgba(34, 197, 94, 0.8));
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 28px;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 4px 20px rgba(74, 222, 128, 0.4);
  transition: all 0.3s;
  animation: float 3s ease-in-out infinite;
}

.mobile-focus-btn:active {
  transform: scale(0.95);
}

/* 响应式设计 - 平板 */
@media (max-width: 1023px) {
  .right-sidebar {
    right: 12px !important;
    gap: 12px !important;
  }

  .ai-float-btn {
    bottom: 80px;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 767px) {
  /* 隐藏右侧栏 */
  .right-sidebar {
    display: none !important;
  }

  /* AI按钮移到左下角 */
  .ai-float-btn {
    bottom: calc(var(--mobile-nav-height, 64px) + 16px);
    right: auto;
    left: 20px;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  /* 显示移动端专注按钮 */
  .mobile-focus-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 调整3D画布 */
  .canvas-layer :deep(canvas) {
    touch-action: pan-x pan-y;
  }
}

/* 安全区域适配 (iPhone X 等) */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (max-width: 767px) {
    .ai-float-btn {
      bottom: calc(var(--mobile-nav-height, 64px) + env(safe-area-inset-bottom) + 16px);
    }

    .mobile-focus-btn {
      bottom: calc(var(--mobile-nav-height, 64px) + env(safe-area-inset-bottom) + 80px);
    }
  }
}
</style>
