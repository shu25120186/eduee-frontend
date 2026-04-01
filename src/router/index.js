import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginPage.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/',
    name: 'Island',
    component: () => import('../components/RealIsland3D.vue'),
    meta: { title: '我的岛屿', requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/Dashboard.vue'),
    meta: { title: '数据仪表盘', requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../components/Leaderboard.vue'),
    meta: { title: '排行榜', requiresAuth: true }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('../components/AchievementPanel.vue'),
    meta: { title: '成就墙', requiresAuth: true }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: () => import('../components/FriendsPanel.vue'),
    meta: { title: '好友', requiresAuth: true }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../components/ShopPanel.vue'),
    meta: { title: '商店', requiresAuth: true }
  },
  {
    path: '/ai',
    name: 'AIAssistant',
    component: () => import('../components/AIAssistant.vue'),
    meta: { title: 'AI学习助手', requiresAuth: true }
  },
  {
    path: '/plans',
    name: 'StudyPlan',
    component: () => import('../components/StudyPlan.vue'),
    meta: { title: '学习计划', requiresAuth: true }
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('../components/EventPanel.vue'),
    meta: { title: '活动 & 签到', requiresAuth: true }
  },
  {
    path: '/exam',
    name: 'Exam',
    component: () => import('../components/ExamPage.vue'),
    meta: { title: '英语模考', requiresAuth: true }
  },
  {
    path: '/pk',
    name: 'PKChallenge',
    component: () => import('../components/PKChallenge.vue'),
    meta: { title: 'PK挑战', requiresAuth: true }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'EduEE'} - 伏特自律岛`

  const isLoggedIn = localStorage.getItem('username')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})
