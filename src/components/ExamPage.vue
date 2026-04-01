<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const API_BASE = 'http://127.0.0.1:8000'

const exams = ref([])
const selectedExam = ref(null)
const examConfig = ref(null)
const answers = ref({})
const isSubmitting = ref(false)
const isLoading = ref(false)
const showResult = ref(false)
const result = ref(null)
const timeLeft = ref(0)
let timer = null

const loadExams = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_BASE}/api/exams`)
    exams.value = res.data.exams || []
  } catch (error) {
    console.error('加载考试列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

const selectExam = (exam) => {
  selectedExam.value = exam
  examConfig.value = exam.config_json
  answers.value = {}
  showResult.value = false
  result.value = null
  timeLeft.value = exam.time_limit || 60

  // 初始化答案
  if (examConfig.value?.sections) {
    examConfig.value.sections.forEach(section => {
      if (section.questions) {
        section.questions.forEach(q => {
          answers.value[q.id] = ''
        })
      }
    })
  }

  // 开始计时
  startTimer()
}

const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      submitExam()
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const submitExam = async () => {
  if (timer) clearInterval(timer)
  isSubmitting.value = true

  try {
    const res = await axios.post(`${API_BASE}/api/submit_exam`, {
      exam_code: selectedExam.value.exam_code,
      username: userStore.username,
      answers: answers.value
    })

    result.value = res.data
    showResult.value = true

    // 获得经验奖励
    if (res.data.exp_gained) {
      await userStore.loadGrowth()
    }
  } catch (error) {
    alert('提交失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  if (timer) clearInterval(timer)
  if (showResult.value) {
    showResult.value = false
    result.value = null
    selectedExam.value = null
    examConfig.value = null
  } else if (selectedExam.value) {
    if (confirm('确定要退出考试吗？当前进度将丢失。')) {
      selectedExam.value = null
      examConfig.value = null
      if (timer) clearInterval(timer)
    }
  } else {
    router.push('/')
  }
}

const getScoreColor = (score) => {
  if (score >= 90) return '#4ade80'
  if (score >= 70) return '#fbbf24'
  if (score >= 60) return '#fb923c'
  return '#f87171'
}

onMounted(() => {
  loadExams()
})
</script>

<template>
  <div class="exam-container">
    <!-- 顶部导航 -->
    <div class="exam-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>📝 英语模考</h1>
      <div v-if="selectedExam && !showResult" class="timer" :class="{ warning: timeLeft < 300 }">
        ⏱️ {{ formatTime(timeLeft) }}
      </div>
      <div v-else class="header-spacer"></div>
    </div>

    <!-- 考试列表 -->
    <div v-if="!selectedExam" class="exam-list">
      <div class="section-title">选择试卷</div>
      <div class="exams-grid">
        <div
          v-for="exam in exams"
          :key="exam.exam_code"
          class="exam-card"
          @click="selectExam(exam)"
        >
          <div class="exam-icon">📄</div>
          <div class="exam-info">
            <h3>{{ exam.title }}</h3>
            <p>限时 {{ exam.time_limit || 60 }} 分钟</p>
          </div>
          <button class="start-btn">开始答题</button>
        </div>
      </div>

      <div v-if="exams.length === 0 && !isLoading" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无可用试卷</p>
      </div>
    </div>

    <!-- 答题界面 -->
    <div v-else-if="selectedExam && !showResult" class="question-panel">
      <div class="exam-title-bar">
        <h2>{{ selectedExam.title }}</h2>
      </div>

      <div class="sections-container">
        <div v-for="(section, sIdx) in examConfig?.sections" :key="sIdx" class="section-block">
          <h3 class="section-title">{{ section.name }}</h3>
          <p v-if="section.instruction" class="section-instruction">{{ section.instruction }}</p>

          <div v-for="(q, qIdx) in section.questions" :key="q.id" class="question-item">
            <div class="question-header">
              <span class="question-number">{{ qIdx + 1 }}</span>
              <span class="question-text">{{ q.question }}</span>
            </div>

            <!-- 选择题 -->
            <div v-if="q.type === 'choice'" class="options-list">
              <label
                v-for="(opt, optKey) in q.options"
                :key="optKey"
                class="option-item"
                :class="{ selected: answers[q.id] === optKey }"
              >
                <input
                  type="radio"
                  :name="q.id"
                  :value="optKey"
                  v-model="answers[q.id]"
                />
                <span class="option-key">{{ optKey }}</span>
                <span class="option-text">{{ opt }}</span>
              </label>
            </div>

            <!-- 填空题 -->
            <div v-else-if="q.type === 'fill'" class="fill-input">
              <input
                type="text"
                v-model="answers[q.id]"
                placeholder="请输入答案"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="submit-bar">
        <button class="submit-btn" @click="submitExam" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交试卷' }}
        </button>
      </div>
    </div>

    <!-- 成绩展示 -->
    <div v-else-if="showResult && result" class="result-panel">
      <div class="result-header">
        <div class="score-circle" :style="{ borderColor: getScoreColor(result.score) }">
          <span class="score-value" :style="{ color: getScoreColor(result.score) }">{{ result.score }}</span>
          <span class="score-label">分</span>
        </div>
        <h2>{{ result.score >= 90 ? '优秀！' : result.score >= 70 ? '良好！' : result.score >= 60 ? '及格' : '继续加油！' }}</h2>
        <p v-if="result.exp_gained">获得 {{ result.exp_gained }} 经验值</p>
      </div>

      <div class="result-details">
        <div class="result-stat">
          <span class="stat-label">客观题得分</span>
          <span class="stat-value">{{ result.objective_score?.toFixed(1) || 0 }}</span>
        </div>
        <div class="result-stat">
          <span class="stat-label">题目总数</span>
          <span class="stat-value">{{ result.total_questions || 0 }}</span>
        </div>
      </div>

      <div v-if="result.mistakes?.length > 0" class="mistakes-section">
        <h3>❌ 错题回顾</h3>
        <div v-for="(m, idx) in result.mistakes" :key="idx" class="mistake-item">
          <div class="mistake-question">{{ m.question }}</div>
          <div class="mistake-answer">
            <span class="wrong">你的答案: {{ m.user }}</span>
            <span class="correct">正确答案: {{ m.correct }}</span>
          </div>
        </div>
      </div>

      <button class="back-btn-large" @click="goBack">返回试卷列表</button>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.exam-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  color: white;
  padding-bottom: 100px;
}

.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin-bottom: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
}

h1 { margin: 0; font-size: 24px; }
.header-spacer { width: 100px; }

.timer {
  font-size: 18px;
  font-weight: 700;
  padding: 8px 16px;
  background: rgba(74, 222, 128, 0.2);
  border-radius: 12px;
}

.timer.warning {
  background: rgba(248, 113, 113, 0.3);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.exams-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.exam-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.exam-icon {
  font-size: 40px;
}

.exam-info {
  flex: 1;
}

.exam-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.exam-info p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.start-btn {
  padding: 10px 20px;
  background: rgba(74, 222, 128, 0.25);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: white;
  border-radius: 12px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.question-panel {
  max-width: 800px;
  margin: 0 auto;
}

.exam-title-bar {
  margin-bottom: 24px;
}

.exam-title-bar h2 {
  margin: 0;
  font-size: 22px;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-block {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
}

.section-instruction {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.question-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.question-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.question-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.question-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 222, 128, 0.25);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.question-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 40px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.option-item.selected {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
}

.option-item input {
  display: none;
}

.option-key {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.option-text {
  flex: 1;
  font-size: 14px;
}

.fill-input input {
  width: 100%;
  max-width: 300px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  outline: none;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: rgba(30, 40, 60, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
}

.submit-btn {
  padding: 14px 48px;
  background: rgba(74, 222, 128, 0.3);
  border: 1px solid rgba(74, 222, 128, 0.5);
  color: white;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-panel {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.result-header {
  padding: 40px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  margin-bottom: 24px;
}

.score-circle {
  width: 140px;
  height: 140px;
  margin: 0 auto 20px;
  border-radius: 50%;
  border: 6px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.result-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.result-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.result-details {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.result-stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #4ade80;
}

.mistakes-section {
  background: rgba(248, 113, 113, 0.1);
  border-radius: 20px;
  padding: 24px;
  text-align: left;
  margin-bottom: 24px;
}

.mistakes-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.mistake-item {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 8px;
}

.mistake-question {
  font-size: 14px;
  margin-bottom: 8px;
}

.mistake-answer {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.wrong { color: #f87171; }
.correct { color: #4ade80; }

.back-btn-large {
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 14px;
  font-size: 16px;
  cursor: pointer;
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
</style>
