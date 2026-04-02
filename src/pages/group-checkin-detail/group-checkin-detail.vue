<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="toolbar">
        <button class="refresh-btn" @click="refresh">🔄</button>
      </view>

      <view class="checkin-stats">
        <view class="stats-header">
          <view class="group-icon">
            <text>{{ groupIcon }}</text>
          </view>
          <view class="group-info">
            <text class="group-name">{{ groupName }}</text>
            <text class="today-date">{{ todayStr }}</text>
          </view>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">12</text>
            <text class="stat-label">今日打卡</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">28</text>
            <text class="stat-label">总成员数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">42.8%</text>
            <text class="stat-label">打卡率</text>
          </view>
        </view>
        <view class="stats-grid second">
          <view class="stat-item">
            <text class="stat-value">11</text>
            <text class="stat-label">成功控烟</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">1</text>
            <text class="stat-label">没忍住</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">91.7%</text>
            <text class="stat-label">成功率</text>
          </view>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" style="width: 42.8%" />
        </view>
      </view>

      <view class="calendar-section">
        <text class="section-title">📅 本月打卡日历</text>
        <view class="calendar">
          <text v-for="h in weekHeaders" :key="h" class="calendar-header">{{ h }}</text>
          <view
            v-for="(cell, ci) in calendarCells"
            :key="ci"
            class="calendar-day"
            :class="cell.cls"
          >
            <text v-if="cell.day">{{ cell.day }}</text>
          </view>
        </view>
        <view class="calendar-legend">
          <text class="legend-text">✅ 已打卡  ❌ 未打卡  🔵 今日</text>
          <text class="legend-rate">本月打卡率：100%</text>
        </view>
      </view>

      <view class="members-section">
        <text class="section-title">👥 今日打卡成员</text>
        <view class="members-list">
          <view v-for="(m, mi) in checkinMembers" :key="mi" class="member-row">
            <view class="member-avatar">
              <text>{{ m.av }}</text>
            </view>
            <view class="member-info">
              <text class="member-name">{{ m.name }}</text>
              <text class="member-time">{{ m.time }}</text>
            </view>
            <view class="checkin-status" :class="m.statusClass">
              <text>{{ m.status }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const groupName = ref('戒烟互助群')
const groupIcon = ref('💪')

const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

const todayStr = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

const calendarCells = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const firstDow = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const today = now.getDate()
  const cells: { day: number; cls: string }[] = []
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: 0, cls: 'empty' })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    let cls = 'checked'
    if (d > today) cls = 'future'
    else if (d === today) cls = 'today'
    else cls = 'checked'
    cells.push({ day: d, cls })
  }
  return cells
})

const checkinMembers = [
  { av: '我', name: '李明', time: '09:15 已打卡', status: '已打卡', statusClass: 'checked' },
  { av: '张', name: '张伟', time: '08:30 已打卡', status: '已打卡', statusClass: 'checked' },
  { av: '王', name: '王强', time: '10:20 已打卡', status: '已打卡', statusClass: 'checked' },
  { av: '李', name: '李华', time: '-', status: '待打卡', statusClass: 'pending' },
  { av: '+9', name: '其他成员', time: '共9人已打卡', status: '查看全部', statusClass: 'checked' },
]

onLoad((q?: Record<string, string>) => {
  if (q?.name) groupName.value = decodeURIComponent(String(q.name))
  if (q?.icon) groupIcon.value = decodeURIComponent(String(q.icon))
})

function refresh() {
  uni.showToast({ title: '数据已刷新', icon: 'success' })
}
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
  padding-bottom: 48rpx;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16rpx;
}

.refresh-btn {
  background: transparent;
  border: none;
  font-size: 40rpx;
  padding: 8rpx 16rpx;
}

.checkin-stats,
.calendar-section,
.members-section {
  background: #fff;
  padding: 28rpx;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  margin-bottom: 24rpx;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.group-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #fff;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 40rpx;
  font-weight: 600;
  color: $color-text;
  display: block;
  margin-bottom: 8rpx;
}

.today-date {
  font-size: 28rpx;
  color: $color-text-sub;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.stats-grid.second {
  margin-top: 12rpx;
}

.stat-item {
  text-align: center;
  padding: 24rpx;
  background: $color-bg;
  border-radius: 16rpx;
}

.stat-value {
  font-size: 44rpx;
  font-weight: 600;
  color: $color-primary;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $color-text-sub;
}

.progress-bar {
  height: 16rpx;
  background: #eee;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $color-primary;
  border-radius: 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  display: block;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.calendar-header {
  text-align: center;
  font-size: 24rpx;
  color: $color-text-sub;
  padding: 12rpx 0;
}

.calendar-day {
  width: 64rpx;
  height: 64rpx;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.calendar-day.empty {
  visibility: hidden;
}

.calendar-day.checked {
  background: #27ae60;
  color: #fff;
}

.calendar-day.missed {
  background: $color-danger;
  color: #fff;
}

.calendar-day.today {
  border: 4rpx solid $color-primary;
  background: #fff;
  color: $color-text;
}

.calendar-day.future {
  color: $color-text-sub;
  background: $color-bg;
}

.calendar-legend {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  font-size: 24rpx;
  color: $color-text-sub;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border: 1rpx solid #eee;
  border-radius: 16rpx;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
  display: block;
  margin-bottom: 8rpx;
}

.member-time {
  font-size: 24rpx;
  color: $color-text-sub;
}

.checkin-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.checkin-status.checked {
  background: #27ae60;
  color: #fff;
}

.checkin-status.pending {
  background: $color-warn;
  color: #fff;
}
</style>
