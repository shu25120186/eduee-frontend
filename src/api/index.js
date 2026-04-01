import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================
// 用户认证 API
// ============================================
export const authApi = {
  login: (username, password) => api.post('/api/login', { username, password }),
  register: (username, password) => api.post('/api/register', { username, password })
}

// ============================================
// 成长系统 API
// ============================================
export const growthApi = {
  get: (username) => api.get(`/api/growth/${username}`),
  addExp: (username, expAmount, source) => api.post('/api/growth/add-exp', { username, exp_amount: expAmount, source }),
  checkStreak: (username) => api.post('/api/growth/check-streak', { username }),
  updateStats: (data) => api.post('/api/growth/update-stats', data),
  updateDiscipline: (username, phoneMinutes) => api.post('/api/growth/update-discipline', { username, phone_minutes: phoneMinutes })
}

// ============================================
// 专注系统 API
// ============================================
export const focusApi = {
  start: (username, subject, duration, treeType) => api.post('/api/focus/start', { username, subject, duration, tree_type: treeType }),
  end: (sessionId, username, status) => api.post('/api/focus/end', { session_id: sessionId, username, status }),
  complete: (username, duration, subject) => api.post('/api/focus/complete', { username, duration, subject }),
  stats: (username) => api.get(`/api/focus/stats/${username}`)
}

// ============================================
// 任务系统 API
// ============================================
export const taskApi = {
  add: (username, content) => api.post('/api/todo/add', { username, content }),
  list: (username) => api.get(`/api/todo/${username}`),
  toggle: (taskId, username) => api.post('/api/todo/toggle', { task_id: taskId, username }),
  delete: (taskId, username) => api.post('/api/todo/delete', { task_id: taskId, username }),
  score: (taskId, username, proofUrl) => api.post(`/api/tasks/${taskId}/score`, { username, proof_url: proofUrl })
}

// ============================================
// 道具系统 API
// ============================================
export const itemApi = {
  inventory: (username) => api.get(`/api/items/inventory/${username}`),
  use: (username, itemId) => api.post('/api/items/use', { username, item_id: itemId }),
  definitions: () => api.get('/api/items/definitions'),
  synthesize: (username, recipeId) => api.post('/api/items/synthesize', { username, recipe_id: recipeId }),
  recipes: () => api.get('/api/items/recipes'),
  market: () => api.get('/api/items/market'),
  list: (data) => api.post('/api/items/list', data),
  buy: (data) => api.post('/api/items/buy', data)
}

// ============================================
// 手机使用 API
// ============================================
export const phoneApi = {
  report: (username, usageMinutes, category, notes) =>
    api.post('/api/phone-usage/report', { username, usage_minutes: usageMinutes, category, notes }),
  stats: (username, days) => api.get(`/api/phone-usage/stats/${username}`, { params: { days } })
}

// ============================================
// AI 助手 API
// ============================================
export const aiApi = {
  chat: (username, message, conversationId) =>
    api.post('/api/ai/chat', { username, message, conversation_id: conversationId }),
  history: (username, conversationId) =>
    api.get(`/api/ai/history/${username}`, { params: { conversation_id: conversationId } }),
  suggestions: (username) => api.get(`/api/ai/suggestions/${username}`)
}

// ============================================
// 学习计划 API
// ============================================
export const planApi = {
  create: (data) => api.post('/api/plans/create', data),
  get: (username) => api.get(`/api/plans/${username}`),
  updateProgress: (planId, stageId, completed) =>
    api.put(`/api/plans/${planId}/progress`, { stage_id: stageId, completed }),
  dailyRecommendations: (username) => api.get(`/api/plans/daily-recommendations/${username}`)
}

// ============================================
// 统计 API
// ============================================
export const statsApi = {
  get: (username, period) => api.get(`/api/stats/${username}`, { params: { period } }),
  focusDistribution: (username) => api.get(`/api/stats/${username}/focus-distribution`),
  growthCurve: (username, days) => api.get(`/api/stats/${username}/growth-curve`, { params: { days } })
}

// ============================================
// 排行榜 API
// ============================================
export const leaderboardApi = {
  get: (type, category, period) =>
    api.get('/api/leaderboard', { params: { type, category, period } })
}

// ============================================
// 好友 API
// ============================================
export const friendApi = {
  request: (userUsername, friendUsername) =>
    api.post('/api/friends/request', { user_username: userUsername, friend_username: friendUsername }),
  respond: (friendshipId, status) => api.post('/api/friends/respond', { friendship_id: friendshipId, status }),
  list: (username) => api.get(`/api/friends/${username}`),
  delete: (userUsername, friendUsername) =>
    api.delete('/api/friends', { data: { user_username: userUsername, friend_username: friendUsername } })
}

// ============================================
// 成就 API
// ============================================
export const achievementApi = {
  all: () => api.get('/api/achievements'),
  user: (username) => api.get(`/api/achievements/${username}`),
  check: (username, achievementCode) => api.post('/api/achievements/check', { username, achievement_code: achievementCode })
}

// ============================================
// 岛屿装饰 API
// ============================================
export const islandApi = {
  decorations: () => api.get('/api/island/decorations'),
  buyDecoration: (username, decorationId) =>
    api.post('/api/island/decorations/buy', { username, decoration_id: decorationId }),
  placeDecoration: (username, decorationId, position) =>
    api.put('/api/island/decorations/place', { username, decoration_id: decorationId, position }),
  skins: () => api.get('/api/island/skins'),
  buySkin: (username, skinId) => api.post('/api/island/skins/buy', { username, skin_id: skinId }),
  activateSkin: (username, skinId) => api.put('/api/island/skins/activate', { username, skin_id: skinId })
}

// ============================================
// 活动 API
// ============================================
export const eventApi = {
  list: (activeOnly) => api.get('/api/events', { params: { active_only: activeOnly } }),
  join: (eventId) => api.post(`/api/events/${eventId}/join`),
  updateProgress: (eventId, username, progress) =>
    api.put(`/api/events/${eventId}/progress`, { username, progress })
}

// ============================================
// 签到 API
// ============================================
export const checkinApi = {
  checkin: (username) => api.post('/api/checkin', { username }),
  status: (username) => api.get(`/api/checkin/${username}`)
}

// ============================================
// 社区 API
// ============================================
export const postApi = {
  create: (username, content, imageUrl) =>
    api.post('/api/posts/create', { username, content, image_url: imageUrl }),
  list: (username) => api.get('/api/posts', { params: { username } }),
  like: (postId, username) => api.post('/api/posts/like', { post_id: postId, username }),
  comment: (postId, username, content) => api.post('/api/posts/comment', { post_id: postId, username, content })
}

export default api
