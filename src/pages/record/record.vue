<template>
  <view class="page-root">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <view class="page-header">
        <text class="page-title">戒烟记录</text>
        <text class="page-subtitle">📊 查看您的戒烟历程和统计数据</text>
      </view>

      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">15</text>
          <text class="stat-label">连续无烟天数</text>
          <text class="stat-trend muted">历史最长天数45天</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">¥450</text>
          <text class="stat-label">累计节省金额</text>
          <text class="stat-trend up">↑ 较上周+¥60</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">98%</text>
          <text class="stat-label">30天成功率</text>
          <text class="stat-trend up">↑ 较上周+3%</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">2</text>
          <text class="stat-label">失败次数</text>
          <text class="stat-trend down">↑ 较上周+1次</text>
        </view>
      </view>

      <view class="chart-section">
        <view class="section-title-row">
          <text class="section-title">💚 健康收益</text>
          <text class="section-hint">戒烟15天的成果</text>
        </view>
        <view class="health-stats">
          <view class="health-item">
            <view class="health-icon">
              <text>🫁</text>
            </view>
            <view class="health-info">
              <text class="health-value">肺功能提升 15%</text>
              <text class="health-desc">呼吸更顺畅</text>
            </view>
          </view>
          <view class="health-item">
            <view class="health-icon">
              <text>❤️</text>
            </view>
            <view class="health-info">
              <text class="health-value">心血管风险降低 25%</text>
              <text class="health-desc">心脏更健康</text>
            </view>
          </view>
          <view class="health-item">
            <view class="health-icon">
              <text>🧠</text>
            </view>
            <view class="health-info">
              <text class="health-value">精力提升 30%</text>
              <text class="health-desc">精神状态更好</text>
            </view>
          </view>
        </view>
      </view>

      <view class="chart-section">
        <view class="section-title-row">
          <text class="section-title">📈 戒烟趋势</text>
          <picker :value="periodIndex" :range="periodLabels" @change="onPeriodChange">
            <view class="period-picker">{{ periodLabels[periodIndex] }}</view>
          </picker>
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
          <text class="section-hint">最近30条</text>
        </view>
        <view class="history-list">
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
import AppTabBar from '../../components/AppTabBar.vue'

const periodLabels = ['最近7天', '最近30天', '最近90天']
const periodIndex = ref(1)

const chartDataMap: Record<number, { data: number[]; labels: string[] }> = {
  0: {
    data: [85, 90, 95, 88, 92, 96, 98],
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  1: {
    data: [80, 65, 90, 95],
    labels: ['第1周', '第2周', '第3周', '第4周'],
  },
  2: {
    data: [70, 75, 80, 85, 90, 95],
    labels: ['第1月', '第2月', '第3月', '第4月', '第5月', '第6月'],
  },
}

const chartBars = computed(() => chartDataMap[periodIndex.value]?.data ?? chartDataMap[1].data)
const chartLabels = computed(() => chartDataMap[periodIndex.value]?.labels ?? chartDataMap[1].labels)

const avgRate = computed(() => {
  const arr = chartBars.value
  if (!arr.length) return '0'
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
})

const bestLabel = computed(() => {
  const arr = chartBars.value
  const labels = chartLabels.value
  const max = Math.max(...arr)
  const idx = arr.indexOf(max)
  return `${labels[idx]} ${max}%`
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

function onPeriodChange(e: { detail: { value: string } }) {
  periodIndex.value = Number(e.detail.value)
}

function showDetail(i: number) {
  const v = chartBars.value[i]
  const lb = chartLabels.value[i]
  uni.showToast({ title: `${lb}: ${v}%`, icon: 'none' })
}

const historyItems = [
  { date: '2026-04-02 08:30', ok: true },
  { date: '2026-04-01 09:15', ok: true },
  { date: '2026-03-31 10:00', ok: true },
  { date: '2026-03-30 14:20', ok: false },
  { date: '2026-03-29 08:45', ok: true },
  { date: '2026-03-28 09:30', ok: true },
  { date: '2026-03-27 11:00', ok: true },
  { date: '2026-03-26 16:45', ok: false },
  { date: '2026-03-25 08:20', ok: true },
  { date: '2026-03-24 09:10', ok: true },
]
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
