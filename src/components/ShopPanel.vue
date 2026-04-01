<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { islandApi } from '../api'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const API_BASE = 'http://127.0.0.1:8000'

const decorations = ref([])
const skins = ref([])
const userSkins = ref([])
const isLoading = ref(false)
const activeTab = ref('decorations')
const purchasingId = ref(null)

const userExp = computed(() => userStore.growth.exp || 0)

const loadShop = async () => {
  isLoading.value = true
  try {
    const [decorRes, skinsRes] = await Promise.all([
      islandApi.decorations(),
      islandApi.skins()
    ])
    decorations.value = decorRes.data.decorations || []
    skins.value = skinsRes.data.skins || []

    // 加载用户已购买的皮肤
    await loadUserSkins()
  } catch (error) {
    console.error('加载商店失败:', error)
  } finally {
    isLoading.value = false
  }
}

const loadUserSkins = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/island/skins/${userStore.username}`)
    userSkins.value = res.data.owned_skins || []
  } catch (error) {
    console.error('加载用户皮肤失败:', error)
    userSkins.value = []
  }
}

const buyDecoration = async (decoration) => {
  if (purchasingId.value) return
  if (userExp.value < decoration.cost) {
    alert(`经验值不足！需要 ${decoration.cost} EXP，当前 ${userExp.value} EXP`)
    return
  }

  if (!confirm(`确定要花费 ${decoration.cost} EXP 购买 ${decoration.name} 吗？`)) return

  purchasingId.value = decoration.id
  try {
    const res = await islandApi.buyDecoration(userStore.username, decoration.id)
    alert(res.data.message || '购买成功！')
    await userStore.loadGrowth()
  } catch (error) {
    alert('购买失败: ' + (error.response?.data?.detail || '未知错误'))
  } finally {
    purchasingId.value = null
  }
}

const buySkin = async (skin) => {
  if (purchasingId.value) return

  // 检查是否已拥有
  if (userSkins.value.includes(skin.id)) {
    alert('你已经拥有这个皮肤了！')
    return
  }

  if (userExp.value < skin.cost) {
    alert(`经验值不足！需要 ${skin.cost} EXP，当前 ${userExp.value} EXP`)
    return
  }

  if (!confirm(`确定要花费 ${skin.cost} EXP 购买 ${skin.name} 吗？`)) return

  purchasingId.value = skin.id
  try {
    const res = await axios.post(`${API_BASE}/api/island/skins/buy`, {
      username: userStore.username,
      skin_id: skin.id
    })
    alert(res.data.message || '购买成功！')
    await userStore.loadGrowth()
    await loadUserSkins()
  } catch (error) {
    alert('购买失败: ' + (error.response?.data?.detail || '未知错误'))
  } finally {
    purchasingId.value = null
  }
}

const isSkinOwned = (skinId) => {
  return userSkins.value.includes(skinId)
}

const getRarityColor = (rarity) => {
  const colors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  }
  return colors[rarity] || colors.common
}

const getRarityLabel = (rarity) => {
  const labels = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[rarity] || rarity
}

const goBack = () => router.push('/')

onMounted(() => loadShop())
</script>

<template>
  <div class="shop-container">
    <div class="shop-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>🛒 商店</h1>
      <div class="user-exp">
        <span>⭐</span>
        <span>{{ userExp }} EXP</span>
      </div>
    </div>

    <div class="shop-tabs">
      <button :class="{ active: activeTab === 'decorations' }" @click="activeTab = 'decorations'">
        🏝️ 岛屿装饰
      </button>
      <button :class="{ active: activeTab === 'skins' }" @click="activeTab = 'skins'">
        🎨 岛屿皮肤
      </button>
    </div>

    <!-- 装饰商店 -->
    <div v-if="activeTab === 'decorations'" class="shop-grid">
      <div
        v-for="decoration in decorations"
        :key="decoration.id"
        class="shop-card"
        :class="{ disabled: userExp < decoration.cost }"
      >
        <div class="card-rarity" :style="{ background: getRarityColor(decoration.rarity) }">
          {{ getRarityLabel(decoration.rarity) }}
        </div>
        <div class="card-icon">{{ decoration.type === 'tree' ? '🌳' : decoration.type === 'building' ? '🏠' : '🏡' }}</div>
        <div class="card-info">
          <div class="card-name">{{ decoration.name }}</div>
          <div class="card-type">{{ decoration.type }}</div>
        </div>
        <button
          class="buy-btn"
          :class="{ disabled: userExp < decoration.cost, loading: purchasingId === decoration.id }"
          :disabled="userExp < decoration.cost || purchasingId === decoration.id"
          @click="buyDecoration(decoration)"
        >
          <span v-if="purchasingId === decoration.id">⏳</span>
          <span v-else>💰</span>
          <span>{{ decoration.cost }}</span>
        </button>
      </div>
      <div v-if="decorations.length === 0 && !isLoading" class="empty-state">
        <span class="empty-icon">🏪</span>
        <p>商店正在补货中...</p>
      </div>
    </div>

    <!-- 皮肤商店 -->
    <div v-if="activeTab === 'skins'" class="shop-grid">
      <div
        v-for="skin in skins"
        :key="skin.id"
        class="shop-card"
        :class="{ disabled: userExp < skin.cost && !isSkinOwned(skin.id), owned: isSkinOwned(skin.id) }"
      >
        <div class="card-rarity" :style="{ background: getRarityColor(skin.rarity) }">
          {{ getRarityLabel(skin.rarity) }}
        </div>
        <div class="card-icon">
          {{ skin.skin_code === 'spring' ? '🌸' : skin.skin_code === 'summer' ? '🏖️' : skin.skin_code === 'autumn' ? '🍁' : '❄️' }}
        </div>
        <div class="card-info">
          <div class="card-name">{{ skin.name }}</div>
          <div class="card-desc">{{ skin.description }}</div>
        </div>
        <button
          v-if="isSkinOwned(skin.id)"
          class="buy-btn owned"
          disabled
        >
          <span>✅</span>
          <span>已拥有</span>
        </button>
        <button
          v-else
          class="buy-btn"
          :class="{ disabled: userExp < skin.cost, loading: purchasingId === skin.id }"
          :disabled="userExp < skin.cost || purchasingId === skin.id"
          @click="buySkin(skin)"
        >
          <span v-if="purchasingId === skin.id">⏳</span>
          <span v-else>💰</span>
          <span>{{ skin.cost }}</span>
        </button>
      </div>
      <div v-if="skins.length === 0 && !isLoading" class="empty-state">
        <span class="empty-icon">🎨</span>
        <p>暂无皮肤</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.shop-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  color: white;
  padding-bottom: 100px;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin-bottom: 16px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

h1 { margin: 0; font-size: 24px; }

.user-exp {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 16px;
}

.shop-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.shop-tabs button {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
}

.shop-tabs button.active {
  background: rgba(74, 222, 128, 0.25);
  border-color: rgba(74, 222, 128, 0.5);
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.shop-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px 16px;
  text-align: center;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.shop-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.shop-card.disabled {
  opacity: 0.6;
}

.shop-card.owned {
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.3);
}

.card-rarity {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.card-info { margin-bottom: 16px; min-height: 50px; }
.card-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.card-type, .card-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.buy-btn {
  width: 100%;
  background: rgba(251, 191, 36, 0.25);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: white;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.buy-btn:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.4);
  transform: scale(1.02);
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buy-btn.owned {
  background: rgba(74, 222, 128, 0.25);
  border-color: rgba(74, 222, 128, 0.4);
}

.buy-btn.loading {
  pointer-events: none;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #4ade80;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 响应式设计 - 平板 */
@media (max-width: 1023px) {
  .shop-container {
    padding: 16px;
  }

  .shop-header {
    padding: 14px 18px;
  }

  h1 {
    font-size: 20px;
  }

  .user-exp {
    padding: 8px 16px;
    font-size: 14px;
  }

  .shop-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 767px) {
  .shop-container {
    padding: 12px;
    padding-bottom: calc(var(--mobile-nav-height, 64px) + env(safe-area-inset-bottom) + 20px);
  }

  .shop-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 14px;
  }

  h1 {
    font-size: 18px;
    order: -1;
    width: 100%;
    text-align: center;
  }

  .back-btn {
    order: 1;
  }

  .user-exp {
    order: 2;
    font-size: 13px;
    padding: 6px 12px;
  }

  .shop-tabs {
    gap: 6px;
    margin-bottom: 16px;
  }

  .shop-tabs button {
    padding: 12px;
    font-size: 14px;
  }

  .shop-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .shop-card {
    padding: 14px 12px;
    border-radius: 16px;
  }

  .card-rarity {
    font-size: 9px;
    padding: 3px 8px;
  }

  .card-icon {
    font-size: 32px;
    margin: 8px 0;
  }

  .card-name {
    font-size: 13px;
  }

  .card-type, .card-desc {
    font-size: 11px;
  }

  .buy-btn {
    padding: 8px 10px;
    font-size: 13px;
    margin-top: 10px;
  }
}
</style>
