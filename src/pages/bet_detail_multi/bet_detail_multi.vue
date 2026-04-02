<template>
  <scroll-view scroll-y class="page" :show-scrollbar="false">
    <view v-if="!bet && loading" class="hint">加载中…</view>
    <view v-else-if="!bet && !loading" class="hint">赌约不存在或无权查看</view>

    <template v-else-if="bet">
      <view class="page-head">
        <text class="page-title">赌约详情</text>
        <view class="head-actions">
          <button class="mini-pill" @click="sharePoster">分享</button>
          <text class="link-edit" @click="goEdit">编辑</text>
        </view>
      </view>

      <!-- 赌约基本信息 bet-detail.html -->
      <view class="bet-info">
        <view class="bet-header">
          <view class="bet-opponent">
            <view class="opponent-avatar">
              <text>{{ titleAvatar }}</text>
            </view>
            <view class="opponent-info">
              <text class="opponent-name">{{ bet.title || '赌约' }}</text>
              <text class="bet-period">{{ remainLabel || statusLine }}</text>
            </view>
          </view>
          <view class="bet-status" :class="{ losing: rankIsBehind }">
            <text>{{ rankHintText || statusLine }}</text>
          </view>
        </view>
        <text class="bet-stake">赌注：{{ stakeLine || '—' }}</text>
        <view class="bet-participants">
          <view class="bp-left">
            <text class="bp-label">参与人：</text>
            <view class="bp-avatars">
              <view
                v-for="(p, i) in participantLines.slice(0, 6)"
                :key="p.key"
                class="bp-av"
                :class="'tone-' + (i % 3)"
              >
                <text>{{ p.av }}</text>
              </view>
            </view>
          </view>
          <button class="invite-btn" @click="goInviteOpponent">邀请对手</button>
        </view>
      </view>

      <!-- 博弈进度条（至少两人时） -->
      <view v-if="participantLines.length >= 2" class="duel-card">
        <view class="duel-labels">
          <text>博弈进度</text>
          <text class="warn">{{ rankHintText }}</text>
        </view>
        <view class="bar-bg">
          <view class="seg me" :style="{ flex: duelBar.me }" />
          <view class="seg them" :style="{ flex: duelBar.them }" />
        </view>
        <view class="duel-nums">
          <text>{{ duelBar.left?.name }} · {{ duelBar.left?.days }}天无烟</text>
          <text>{{ duelBar.right?.name }} · {{ duelBar.right?.days }}天无烟</text>
        </view>
      </view>

      <!-- 打卡状态 -->
      <view class="checkin-status">
        <text class="status-title">今日打卡状态</text>
        <view class="participants">
          <view v-for="p in participantLines" :key="p.key" class="participant">
            <view class="participant-avatar">
              <text>{{ p.av }}</text>
            </view>
            <text class="participant-name">{{ p.name }}</text>
            <text class="participant-stats">{{ p.days }}天无烟</text>
          </view>
        </view>
        <view class="today-checkin-row">
          <button
            class="checkin-btn"
            :class="{ checked: todayLocked }"
            :disabled="todayLocked"
            @click="confirmCheckin(true)"
          >
            {{ todayLocked ? '今日已打卡' : '今日无烟打卡' }}
          </button>
          <button
            class="checkin-btn smoked"
            :disabled="todayLocked"
            @click="confirmCheckin(false)"
          >
            今日吸烟记录
          </button>
        </view>
      </view>

      <!-- 时间线 -->
      <view class="timeline-section">
        <text class="timeline-title">📅 打卡时间线</text>
        <view v-if="timelineRows.length === 0" class="hint sm">暂无时间线</view>
        <view v-else class="timeline-header">
          <text class="day-label">第几天</text>
          <view class="participant-labels">
            <text
              v-for="(lab, li) in timelineColumnLabels"
              :key="li"
              class="participant-label"
            >{{ lab }}</text>
          </view>
          <text class="time-label">状态</text>
        </view>
        <view v-for="(row, ri) in timelineRows" :key="ri" class="timeline-day">
          <text class="day-number" :class="{ current: row.isToday }">{{ row.dayIndex }}</text>
          <view class="day-status">
            <view class="status-icons">
              <view
                v-for="(c, ci) in row.cells"
                :key="ci"
                class="status-icon"
                :class="c === true ? 'checked' : c === false ? 'smoked' : 'pending'"
              >
                <text>{{ c === true ? sym.check : c === false ? sym.cross : '·' }}</text>
              </view>
            </view>
          </view>
          <text class="day-time">{{ row.dateKey || row.label }}</text>
        </view>
      </view>

      <view class="action-buttons">
        <button class="action-btn primary" @click="goInviteWitness">邀请见证人</button>
        <button class="action-btn secondary" @click="remindOpponent">提醒对手打卡</button>
        <button class="action-btn warning" @click="confirmAbandon">放弃赌约</button>
      </view>
    </template>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBetDetail } from '@/composables/useBetDetail'

const {
  bet,
  loading,
  statusLine,
  remainLabel,
  stakeLine,
  myRankHint,
  rankHintText,
  participantLines,
  duelBar,
  timelineRows,
  timelineColumnLabels,
  sym,
  todayLocked,
  initRoute,
  confirmCheckin,
  confirmAbandon,
  goEdit,
  goInviteOpponent,
  goInviteWitness,
  remindOpponent,
  sharePoster,
} = useBetDetail()

initRoute()

const titleAvatar = computed(() => {
  const t = String(bet.value?.title || '?')
  return t.slice(0, 1)
})

const rankIsBehind = computed(() => myRankHint.value === 'behind')
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
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

.page-head {
  background: #fff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 34rpx;
  font-weight: 600;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.mini-pill {
  padding: 10rpx 24rpx;
  border-radius: 32rpx;
  border: none;
  font-size: 24rpx;
  background: $color-primary;
  color: #fff;
}

.link-edit {
  font-size: 28rpx;
  color: $color-primary;
  font-weight: 600;
}

.bet-info {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.bet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.bet-opponent {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.opponent-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: 600;
}

.opponent-name {
  font-size: 32rpx;
  font-weight: 600;
}

.bet-period {
  font-size: 26rpx;
  color: $color-text-sub;
}

.bet-status {
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  border-radius: 32rpx;
  background: $color-warn;
  color: #fff;
  font-weight: 600;
}

.bet-status.losing {
  background: $color-danger;
}

.bet-stake {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-warn;
  margin-bottom: 24rpx;
  display: block;
}

.bet-participants {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16rpx;
}

.bp-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.bp-label {
  font-size: 26rpx;
  color: $color-text-sub;
}

.bp-avatars {
  display: flex;
  gap: 8rpx;
}

.bp-av {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22rpx;
}

.bp-av.tone-0 {
  background: $color-primary;
}
.bp-av.tone-1 {
  background: $color-warn;
}
.bp-av.tone-2 {
  background: #27ae60;
}

.invite-btn {
  padding: 10rpx 24rpx;
  border-radius: 32rpx;
  border: none;
  font-size: 24rpx;
  background: $color-primary;
  color: #fff;
}

.duel-card {
  @include card;
  margin: 0 24rpx 24rpx;
  padding: 28rpx;
}

.duel-labels {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 16rpx;
}

.warn {
  color: $color-warn;
  font-weight: 600;
}

.bar-bg {
  display: flex;
  height: 24rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: #eef2f3;
}

.seg.me {
  background: linear-gradient(90deg, $color-primary, $color-primary-dark);
}

.seg.them {
  background: linear-gradient(90deg, $color-warn, #e67e22);
}

.duel-nums {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: $color-text-sub;
  margin-top: 12rpx;
}

.checkin-status {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.status-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  display: block;
}

.participants {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
  flex-wrap: wrap;
  gap: 16rpx;
}

.participant {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 120rpx;
}

.participant-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 12rpx;
}

.participant-name {
  font-size: 26rpx;
  font-weight: 600;
}

.participant-stats {
  font-size: 22rpx;
  color: $color-text-sub;
}

.today-checkin-row {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  flex-wrap: wrap;
}

.checkin-btn {
  padding: 20rpx 40rpx;
  border-radius: 48rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 600;
  background: $color-primary;
  color: #fff;
}

.checkin-btn.smoked {
  background: $color-danger;
}

.checkin-btn.checked {
  background: #95a5a6;
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

.timeline-header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: $color-text-sub;
}

.day-label {
  width: 80rpx;
  text-align: center;
}

.participant-labels {
  flex: 1;
  display: flex;
  justify-content: space-around;
}

.participant-label {
  font-size: 22rpx;
  font-weight: 600;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-label {
  width: 80rpx;
  text-align: center;
}

.timeline-day {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.day-number {
  width: 80rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 600;
  color: $color-text-sub;
}

.day-number.current {
  color: $color-primary;
}

.day-status {
  flex: 1;
}

.status-icons {
  display: flex;
  justify-content: space-around;
}

.status-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
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
  background: #bdc3c7;
  color: #fff;
}

.day-time {
  width: 80rpx;
}

.action-buttons {
  padding: 0 32rpx 48rpx;
}

.action-btn {
  width: 100%;
  padding: 22rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.action-btn.primary {
  background: $color-primary;
  color: #fff;
}

.action-btn.secondary {
  background: $color-bg;
  color: $color-text;
}

.action-btn.warning {
  background: rgba(231, 76, 60, 0.12);
  color: $color-danger;
}
</style>
