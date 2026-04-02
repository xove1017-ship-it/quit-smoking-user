<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <view v-if="!bet && loading" class="hint">加载中…</view>
    <view v-else-if="!bet && !loading" class="hint">赌约不存在或无权查看</view>

    <template v-else-if="bet">
      <!-- 挑战信息（对齐 bet-detail-solo.html） -->
      <view class="challenge-info">
        <text class="challenge-icon">💪</text>
        <text class="challenge-title">{{ bet.title || '单人挑战' }}</text>
        <text class="challenge-period">{{ remainLabel || statusLine }}</text>
        <view class="challenge-status">
          <text>{{ statusLine || '进行中' }}</text>
        </view>
      </view>

      <view class="progress-stats">
        <text class="stats-title">挑战进度</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ soloDays }}</text>
            <text class="stat-label">已坚持天数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ successRateText }}</text>
            <text class="stat-label">成功率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ remainDaysText }}</text>
            <text class="stat-label">剩余天数</text>
          </view>
        </view>
      </view>

      <view class="today-checkin">
        <text class="checkin-title">今日状态</text>
        <view class="checkin-buttons">
          <button
            class="checkin-btn primary"
            :disabled="todayLocked"
            @click="confirmCheckin(true)"
          >
            {{ todayLocked ? '今日已打卡' : '今日无烟打卡' }}
          </button>
          <button
            class="checkin-btn warning"
            :disabled="todayLocked"
            @click="confirmCheckin(false)"
          >
            记录吸烟
          </button>
        </view>
      </view>

      <view class="reward-info">
        <text class="reward-title">🎁 挑战奖励</text>
        <view class="reward-content">
          <text class="reward-text">{{ stakeLine || '自定义奖励' }}</text>
          <text class="reward-description">完成挑战后即可兑现约定</text>
        </view>
        <button v-if="canClaimReward" class="claim-btn" @click="doClaimReward">领取奖励</button>
      </view>

      <view class="timeline-section">
        <text class="timeline-title">打卡时间线</text>
        <view v-if="timelineRows.length === 0" class="hint sm">暂无时间线</view>
        <view v-for="(row, i) in timelineRows" :key="i" class="timeline-day">
          <view class="day-number" :class="{ current: i === 0 }">
            <text>{{ i + 1 }}</text>
          </view>
          <view class="day-status">
            <view
              class="status-icon"
              :class="soloRowClass(row)"
            >
              <text>{{ soloRowIcon(row) }}</text>
            </view>
            <text class="day-time">{{ row.label }}</text>
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <button class="action-btn secondary" @click="goEdit">编辑赌约</button>
        <button class="action-btn warning" @click="confirmAbandon">放弃赌约</button>
      </view>
    </template>
  </scroll-view>
</template>

<script setup lang="ts">
import { useBetDetail } from '@/composables/useBetDetail'

const {
  bet,
  loading,
  statusLine,
  remainLabel,
  stakeLine,
  timelineRows,
  sym,
  todayLocked,
  soloDays,
  successRateText,
  remainDaysText,
  canClaimReward,
  initRoute,
  confirmCheckin,
  confirmAbandon,
  doClaimReward,
  goEdit,
} = useBetDetail()

initRoute()

function soloRowClass(row: { cells: boolean[] }) {
  const ok = row.cells[0]
  if (ok === true) return 'checked'
  if (ok === false) return 'smoked'
  return 'pending'
}

function soloRowIcon(row: { cells: boolean[] }) {
  const ok = row.cells[0]
  if (ok === true) return sym.value.check
  if (ok === false) return sym.value.cross
  return '?'
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
  padding-bottom: 48rpx;
}

.hint {
  text-align: center;
  padding: 80rpx 24rpx;
  color: $color-text-sub;
  font-size: 28rpx;
}
.hint.sm {
  padding: 24rpx;
}

.challenge-info {
  background: #fff;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.challenge-icon {
  font-size: 96rpx;
  display: block;
  margin-bottom: 24rpx;
}

.challenge-title {
  font-size: 40rpx;
  font-weight: 600;
  color: $color-text;
  display: block;
  margin-bottom: 16rpx;
}

.challenge-period {
  font-size: 28rpx;
  color: $color-text-sub;
  display: block;
  margin-bottom: 24rpx;
}

.challenge-status {
  display: inline-block;
  padding: 16rpx 32rpx;
  background: $color-warn;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.progress-stats {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: $color-bg;
  border-radius: 16rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  color: $color-text;
}

.stat-label {
  font-size: 22rpx;
  color: $color-text-sub;
}

.today-checkin {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.checkin-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  display: block;
}

.checkin-buttons {
  display: flex;
  gap: 24rpx;
}

.checkin-btn {
  flex: 1;
  padding: 28rpx 16rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.checkin-btn.primary {
  background: $color-primary;
  color: #fff;
}

.checkin-btn.warning {
  background: $color-danger;
  color: #fff;
}

.checkin-btn[disabled] {
  background: #95a5a6;
  color: #fff;
}

.reward-info {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.reward-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  display: block;
}

.reward-content {
  background: $color-bg;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
}

.reward-text {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-warn;
  display: block;
  margin-bottom: 12rpx;
}

.reward-description {
  font-size: 26rpx;
  color: $color-text-sub;
}

.claim-btn {
  margin-top: 24rpx;
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 16rpx;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.timeline-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.timeline-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  display: block;
}

.timeline-day {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.day-number {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: $color-text-sub;
}

.day-number.current {
  background: $color-primary;
  color: #fff;
}

.day-status {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: $color-bg;
  border-radius: 12rpx;
}

.status-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
}

.status-icon.checked {
  background: #27ae60;
  color: #fff;
}

.status-icon.smoked {
  background: $color-danger;
  color: #fff;
}

.status-icon.pending {
  background: #95a5a6;
  color: #fff;
}

.day-time {
  font-size: 22rpx;
  color: $color-text-sub;
}

.action-buttons {
  padding: 0 32rpx 48rpx;
}

.action-btn {
  width: 100%;
  padding: 28rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.action-btn.secondary {
  background: $color-bg;
  color: $color-text-sub;
}

.action-btn.warning {
  background: rgba(231, 76, 60, 0.15);
  color: $color-danger;
}
</style>
