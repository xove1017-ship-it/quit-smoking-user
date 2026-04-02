<template>
  <view class="page-root">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <view class="page-header">
        <text class="page-title">戒烟记录</text>
        <text class="page-subtitle">📊 查看您的戒烟历程和统计数据</text>
      </view>

      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ streakVal }}</text>
          <text class="stat-label">连续无烟天数</text>
          <text class="stat-trend muted">历史最长 {{ maxStreakVal }} 天</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ moneyVal }}</text>
          <text class="stat-label">累计节省金额</text>
          <text class="stat-trend muted">与首页统计同源</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ rate30Val }}</text>
          <text class="stat-label">30天成功率</text>
          <text class="stat-trend muted">最近30个自然日</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ relapseVal }}</text>
          <text class="stat-label">复吸记录天数</text>
          <text class="stat-trend muted">打卡中记录为吸烟的天数</text>
        </view>
      </view>

      <view class="chart-section">
        <view class="section-title-row">
          <text class="section-title">💚 健康收益</text>
          <text class="section-hint">基于打卡与档案估算</text>
        </view>
        <view class="health-stats">
          <view v-for="(h, hi) in healthLines" :key="hi" class="health-item">
            <view class="health-icon">
              <text>{{ h.icon }}</text>
            </view>
            <view class="health-info">
              <text class="health-value">{{ h.value }}</text>
              <text class="health-desc">{{ h.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="chart-section">
        <view class="section-title-row">
          <text class="section-title">📈 戒烟趋势</text>
          <text class="section-hint">近15日无烟情况</text>
        </view>
        <view class="chart-container">
          <view class="chart-visual">
            <view class="chart-bars">
              <view
                v-for="(b, bi) in chartBars"
                :key="bi"
                class="chart-bar"
                :style="barStyle(b)"
                @click="showDetail(bi)"
              />
            </view>
            <view class="chart-labels">
              <text v-for="(lb, li) in chartLabels" :key="li" class="chart-label">{{ lb }}</text>
            </view>
          </view>
          <view class="chart-summary">
            <view class="summary-item">
              <text class="summary-k">平均成功率:</text>
              <text class="summary-v primary">{{ avgRate }}%</text>
            </view>
            <view class="summary-item">
              <text class="summary-k">最佳表现:</text>
              <text class="summary-v success">{{ bestLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="history-section">
        <view class="section-title-row">
          <text class="section-title">📝 打卡历史</text>
          <text class="section-hint">最近打卡</text>
        </view>
        <view class="history-list">
          <view v-if="!historyItems.length" class="section-hint" style="padding: 24rpx 0">暂无打卡记录</view>
          <view v-for="(h, hi) in historyItems" :key="hi" class="history-item">
            <text class="history-date">{{ h.date }}</text>
            <view class="history-status" :class="h.ok ? 'status-success' : 'status-failure'">
              <text>{{ h.ok ? '成功' : '失败' }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <AppTabBar :active="3" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppTabBar from '../../components/AppTabBar.vue'
import checkinApi from '@/api/checkin'
import type { RecordStatsData } from '@/api/checkin'

const streakVal = ref('—')
const maxStreakVal = ref('—')
const moneyVal = ref('—')
const rate30Val = ref('—')
const relapseVal = ref('—')

const healthLines = ref<{ icon: string; value: string; desc: string }[]>([
  { icon: '🫁', value: '加载中…', desc: '少吸支数（服务端汇总）' },
])

const trend15 = ref<{ data: number[]; labels: string[] }>({ data: [], labels: [] })

const chartBars = computed(() => trend15.value.data)
const chartLabels = computed(() => trend15.value.labels)

const avgRate = computed(() => {
  const arr = chartBars.value
  if (!arr.length) return '0'
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
})

const bestLabel = computed(() => {
  const arr = chartBars.value
  const labels = chartLabels.value
  if (!arr.length) return '—'
  const max = Math.max(...arr)
  const idx = arr.indexOf(max)
  return `${labels[idx] ?? ''} ${max}%`
})

function trendToBars(trend: unknown[] | undefined): { data: number[]; labels: string[] } {
  if (!trend?.length) return { data: [], labels: [] }
  const data = trend.map((row) => {
    const r = row as Record<string, unknown>
    if (r.is_smoke_free === 1 || r.is_smoke_free === true || r.smoke_free === 1) return 100
    if (r.is_smoke_free === 0 || r.smoke_free === 0) return 25
    if (r.has_checkin === false || r.checked === false) return 0
    return 60
  })
  const labels = trend.map((row, i) => {
    const r = row as Record<string, unknown>
    const d = r.date ?? r.day ?? r.label
    return d != null ? String(d).replace(/^\d{4}-/, '') : `${i + 1}日`
  })
  return { data, labels }
}

function applyStats(d: RecordStatsData) {
  streakVal.value = d.streak_days != null ? String(d.streak_days) : '—'
  maxStreakVal.value = d.max_historical_streak != null ? String(d.max_historical_streak) : '—'
  moneyVal.value =
    d.money_saved_yuan != null ? `¥${d.money_saved_yuan}` : '—'
  if (d.success_rate_30_days != null) {
    const n = Number(d.success_rate_30_days)
    rate30Val.value = Number.isNaN(n) ? String(d.success_rate_30_days) : `${n % 1 === 0 ? n : n.toFixed(1)}%`
  } else {
    rate30Val.value = '—'
  }
  relapseVal.value = d.relapse_days != null ? String(d.relapse_days) : '—'

  const cigs = d.cigarettes_avoided
  const life = d.life_minutes_recovered
  healthLines.value = [
    {
      icon: '🚭',
      value: `约少吸 ${cigs != null ? cigs : '—'} 支烟`,
      desc: '按档案与打卡由服务端估算',
    },
    {
      icon: '❤️',
      value: `生命时间约 +${life != null ? life : '—'} 分钟`,
      desc: '按少吸支数估算',
    },
  ]

  trend15.value = trendToBars(d.trend_15days)
}

function mapCalendarList(list: unknown[]): { date: string; ok: boolean }[] {
  if (!Array.isArray(list)) return []
  return list.slice(0, 40).map((row) => {
    const r = row as Record<string, unknown>
    const ok =
      r.is_smoke_free === 1 ||
      r.is_smoke_free === true ||
      r.smoke_free === 1 ||
      r.today_status === 'SUCCESS'
    return {
      date: String(r.date ?? r.checkin_date ?? r.created_at ?? ''),
      ok: !!ok,
    }
  })
}

const historyItems = ref<{ date: string; ok: boolean }[]>([])

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function formatRangeDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 60)
  const fmt = (x: Date) =>
    `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`
  return { start: fmt(start), end: fmt(end) }
}

function loadRecord() {
  const range = formatRangeDates()
  Promise.all([checkinApi.recordStats(), checkinApi.calendar(range)])
    .then(([statsRes, calRes]) => {
      applyStats((statsRes.data || {}) as RecordStatsData)
      const list = (calRes.data as { list?: unknown[] })?.list
      historyItems.value = mapCalendarList(list || []).reverse()
    })
    .catch(() => {
      /* request 已 toast */
    })
}

onShow(() => {
  loadRecord()
})

function barStyle(h: number) {
  let bg = '#1abc9c'
  if (h >= 90) bg = '#27ae60'
  else if (h < 80) bg = '#f39c12'
  return {
    height: `${h}%`,
    background: bg,
  }
}

function showDetail(i: number) {
  const v = chartBars.value[i]
  const lb = chartLabels.value[i]
  uni.showToast({ title: `${lb}: ${v}%`, icon: 'none' })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

/* barStyle 内联颜色与主题一致 */
$success-green: #27ae60;

.page-root {
  min-height: 100vh;
  background: $color-bg;
}

.page-scroll {
  height: calc(100vh - 120rpx);
  max-height: calc(100vh - env(safe-area-inset-bottom) - 120rpx);
  background: $color-bg;
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

.page-header {
  background: #fff;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text;
  display: block;
  margin-bottom: 12rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: $color-text-sub;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 24rpx;
}

.stat-card {
  @include card;
  padding: 24rpx;
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 600;
  color: $color-primary;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $color-text-sub;
  display: block;
  margin-bottom: 8rpx;
}

.stat-trend {
  font-size: 22rpx;
  display: block;
}

.stat-trend.muted {
  color: $color-text-sub;
}

.stat-trend.up {
  color: $success-green;
}

.stat-trend.down {
  color: $color-danger;
}

.chart-section,
.history-section {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: $card-radius;
  padding: 24rpx;
  box-shadow: $card-shadow;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
}

.section-hint {
  font-size: 24rpx;
  color: $color-text-sub;
}

.period-picker {
  font-size: 24rpx;
  color: $color-primary;
  padding: 8rpx 16rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
}

.health-stats {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: $color-bg;
  border-radius: 16rpx;
}

.health-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.health-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.health-value {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.health-desc {
  font-size: 24rpx;
  color: $color-text-sub;
}

.chart-container {
  background: $color-bg;
  border-radius: 16rpx;
  padding: 24rpx;
}

.chart-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 24rpx;
  height: 240rpx;
  padding: 0 16rpx;
}

.chart-bar {
  width: 48rpx;
  border-radius: 8rpx 8rpx 0 0;
  min-height: 8rpx;
  transition: opacity 0.2s;
}

.chart-labels {
  display: flex;
  gap: 24rpx;
  justify-content: center;
}

.chart-label {
  width: 48rpx;
  text-align: center;
  font-size: 22rpx;
  color: $color-text-sub;
}

.chart-summary {
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
  font-size: 24rpx;
  color: $color-text-sub;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.summary-v.primary {
  color: $color-primary;
  font-weight: 600;
}

.summary-v.success {
  color: $success-green;
  font-weight: 600;
}

.history-list {
  max-height: 600rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  font-size: 28rpx;
  color: $color-text;
}

.history-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
}

.status-success {
  background: $success-green;
  color: #fff;
}

.status-failure {
  background: $color-danger;
  color: #fff;
}
</style>
