<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <!-- 打卡卡片（对齐原型 checkin.html） -->
      <view class="checkin-card">
        <text class="checkin-title">今日控烟状态</text>
        <text class="checkin-date">{{ currentDateText }}</text>

        <view class="checkin-options">
          <view
            class="checkin-option success"
            :class="{ selected: selectedOption === 'success', disabled: pageLocked }"
            @click="selectOption('success')"
          >
            <text class="option-icon">✅</text>
            <text class="option-text">控烟成功</text>
            <text class="option-desc">今日未吸烟</text>
          </view>
          <view
            class="checkin-option warning"
            :class="{ selected: selectedOption === 'warning', disabled: pageLocked }"
            @click="selectOption('warning')"
          >
            <text class="option-icon">⚠️</text>
            <text class="option-text">没忍住</text>
            <text class="option-desc">今日有吸烟</text>
          </view>
        </view>

        <button
          class="submit-btn"
          :disabled="submitDisabled"
          :loading="submitting"
          @click="submitCheckin"
        >
          {{ submitLabel }}
        </button>
      </view>

      <!-- 影响范围 -->
      <view class="section impact-section">
        <text class="section-title">📋 打卡影响范围</text>
        <view class="impact-list">
          <view v-for="(row, i) in impactRows" :key="i" class="impact-item">
            <text class="impact-icon">{{ row.icon }}</text>
            <text class="impact-text">{{ row.text }}</text>
          </view>
        </view>
      </view>

      <!-- 今日统计：与 GET /quit/record/stats 同源（module-profile-checkin-record.md） -->
      <view class="section stats-section">
        <text class="section-title">📈 今日统计</text>
        <view class="stats-grid">
          <view v-for="(s, i) in statsDisplay" :key="i" class="stat-item">
            <text class="stat-value">{{ s.value }}</text>
            <text class="stat-label">{{ s.label }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-pad" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import checkinApi, { type CheckinTodayData, type RecordStatsData } from '@/api/checkin'

const selectedOption = ref<'success' | 'warning' | null>(null)
const currentDateText = ref('')
const hasCheckin = ref(false)
const locked = ref(false)
const submitting = ref(false)
const pageLoading = ref(true)

const statStreak = ref('—')
const statRate30 = ref('—')
const statPerfectWeeks = ref('—')
const statGroups = ref('—')
const statBets = ref('—')

const impactRows = [
  { icon: '📊', text: '个人戒烟记录' },
  { icon: '🎖️', text: '勋章系统进度' },
  { icon: '👥', text: '所有参与的小组' },
  { icon: '💰', text: '所有参与的赌约' },
]

const statsDisplay = computed(() => [
  { value: statStreak.value, label: '连续无烟天数' },
  { value: statRate30.value, label: '30天成功率' },
  { value: statPerfectWeeks.value, label: '完美周数' },
  { value: statGroups.value, label: '参与小组' },
  { value: statBets.value, label: '参与赌约' },
])

function formatTodayDate() {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
}

function formatRate30(v: unknown): string {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  const s = n % 1 === 0 ? String(n) : n.toFixed(1)
  return `${s}%`
}

function fmtInt(v: unknown): string {
  if (v == null || v === '') return '—'
  const n = Number(v)
  return Number.isNaN(n) ? '—' : String(n)
}

const pageLocked = computed(() => hasCheckin.value || locked.value)

const submitDisabled = computed(
  () =>
    pageLocked.value ||
    !selectedOption.value ||
    submitting.value ||
    pageLoading.value,
)

const submitLabel = computed(() => {
  if (pageLocked.value) return '今日已打卡'
  return '提交打卡'
})

function applyToday(d: CheckinTodayData) {
  hasCheckin.value = !!d.has_checkin
  locked.value = !!d.locked
  if (d.has_checkin || d.locked) {
    if (d.is_smoke_free === 1) selectedOption.value = 'success'
    else if (d.is_smoke_free === 0) selectedOption.value = 'warning'
  } else {
    selectedOption.value = null
  }
}

function applyRecordStats(d: RecordStatsData) {
  statStreak.value = fmtInt(d.streak_days)
  statRate30.value = formatRate30(d.success_rate_30_days)
  statPerfectWeeks.value = fmtInt(d.perfect_weeks)
  statGroups.value = fmtInt(d.joined_group_count)
  statBets.value = fmtInt(d.joined_bet_count)
}

function selectOption(opt: 'success' | 'warning') {
  if (pageLocked.value) return
  selectedOption.value = opt
}

async function loadPageData() {
  pageLoading.value = true
  currentDateText.value = formatTodayDate()
  uni.showLoading({ title: '加载中', mask: true })
  try {
    const [todayRes, statsRes] = await Promise.all([
      checkinApi.today(),
      checkinApi.recordStats(),
    ])
    applyToday(todayRes.data || {})
    applyRecordStats(statsRes.data || {})
  } finally {
    uni.hideLoading()
    pageLoading.value = false
  }
}

async function submitCheckin() {
  if (pageLocked.value || !selectedOption.value || submitting.value) return
  const isSmokeFree: 0 | 1 = selectedOption.value === 'success' ? 1 : 0
  submitting.value = true
  try {
    await checkinApi.submit({ is_smoke_free: isSmokeFree })
    const statusText = selectedOption.value === 'success' ? '控烟成功' : '已记录'
    uni.showToast({ title: `打卡成功：${statusText}`, icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 600)
  } finally {
    submitting.value = false
  }
}

onShow(() => {
  loadPageData()
})
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
}

.scroll {
  height: 100vh;
  box-sizing: border-box;
  padding: 24rpx;
}

.checkin-card {
  @include card;
  padding: 48rpx 32rpx;
  margin-bottom: 32rpx;
  text-align: center;
}

.checkin-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 16rpx;
}

.checkin-date {
  display: block;
  font-size: 28rpx;
  color: $color-text-sub;
  margin-bottom: 40rpx;
}

.checkin-options {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.checkin-option {
  flex: 1;
  padding: 32rpx 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 24rpx;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;

  &.success {
    border-color: rgba(39, 174, 96, 0.45);
  }

  &.warning {
    border-color: rgba(231, 76, 60, 0.45);
  }

  &.selected {
    background: rgba(26, 188, 156, 0.1);
    border-color: $color-primary;
  }

  &.disabled {
    opacity: 0.65;
    pointer-events: none;
  }
}

.option-icon {
  display: block;
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.option-text {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 8rpx;
}

.option-desc {
  display: block;
  font-size: 22rpx;
  color: $color-text-sub;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: $color-primary;
  color: #fff;
  border: none;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;

  &[disabled] {
    background: #ccc;
    color: #fff;
  }
}

.section {
  @include card;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 24rpx;
}

.impact-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: $color-mint-tint;
}

.impact-icon {
  font-size: 28rpx;
}

.impact-text {
  font-size: 28rpx;
  color: $color-text;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stat-item {
  text-align: center;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  background: $color-mint-tint;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: $color-text-sub;
}

.bottom-pad {
  height: 48rpx;
}
</style>
