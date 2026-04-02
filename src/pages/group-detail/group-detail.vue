<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="toolbar">
        <button class="tool-btn warn" @click="goInvite">邀请</button>
        <button class="tool-btn primary" @click="shareGroup">分享</button>
      </view>

      <view class="group-info-section">
        <view class="group-header">
          <view class="group-icon big">
            <text>{{ groupIcon }}</text>
          </view>
          <view class="group-details">
            <text class="group-name">{{ groupName }}</text>
            <text class="group-members">👥 28位成员</text>
            <view class="group-status-pill">
              <text>活跃</text>
            </view>
          </view>
        </view>
        <text class="group-description">
          互相监督，共同戒烟！每天分享戒烟心得，互相鼓励支持。这是一个温暖的社区，我们一起战胜烟瘾，迎接健康生活。
        </text>
        <view class="group-stats">
          <view class="stat-item">
            <text class="stat-value">85%</text>
            <text class="stat-label">七日成功率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">12</text>
            <text class="stat-label">今日打卡</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">3</text>
            <text class="stat-label">新消息</text>
          </view>
        </view>
        <button class="checkin-full" @click="goCheckin">今日小组打卡</button>
      </view>

      <view class="members-section">
        <view class="section-title-row">
          <text class="section-title">👥 小组成员</text>
          <text class="section-meta">28人</text>
        </view>
        <view class="members-grid">
          <view v-for="(m, i) in membersShow" :key="i" class="member-item">
            <view class="member-avatar">
              <text>{{ m.av }}</text>
              <view v-if="m.badge" class="vip-badge" :class="m.badgeClass">{{ m.badge }}</view>
            </view>
            <text class="member-name">{{ m.name }}</text>
            <text class="member-status">{{ m.status }}</text>
          </view>
        </view>
      </view>

      <view class="activity-section">
        <view class="section-title-row">
          <text class="section-title">📝 最新动态</text>
          <view class="activity-head-right">
            <text class="section-meta">3条新消息</text>
            <button class="mini-post" @click="goPost">发布动态</button>
          </view>
        </view>
        <view class="activity-list">
          <view v-for="(a, ai) in activities" :key="ai" class="activity-item">
            <view class="activity-avatar">
              <text>{{ a.av }}</text>
              <view v-if="a.badge" class="vip-badge sm" :class="a.badgeClass">{{ a.badge }}</view>
            </view>
            <view class="activity-content">
              <view class="activity-header">
                <text class="activity-user">{{ a.user }}</text>
                <text class="activity-time">{{ a.time }}</text>
              </view>
              <text class="activity-text">{{ a.text }}</text>
              <view class="activity-actions">
                <button class="ghost-btn" @click="likeActivity(a)">👍 {{ a.likes }}</button>
                <button class="ghost-btn" @click="commentActivity(a)">💬 {{ a.comments }}</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const groupName = ref('戒烟互助群')
const groupIcon = ref('💪')

const membersShow = [
  { av: '我', name: '李明', status: '已打卡', badge: '完美', badgeClass: 'rainbow' },
  { av: '张', name: '张伟', status: '已打卡', badge: '完美', badgeClass: 'gold' },
  { av: '王', name: '王强', status: '已打卡', badge: '完美', badgeClass: 'silver' },
  { av: '+', name: '查看更多', status: '25人', badge: '', badgeClass: '' },
]

interface Act {
  av: string
  user: string
  time: string
  text: string
  likes: number
  comments: number
  badge?: string
  badgeClass?: string
}

const activities = ref<Act[]>([
  {
    av: '张',
    user: '张伟',
    time: '10分钟前',
    text: '今天成功拒绝了同事递烟，感觉很有成就感！',
    likes: 12,
    comments: 5,
    badge: '完美',
    badgeClass: 'gold',
  },
  {
    av: '王',
    user: '王强',
    time: '1小时前',
    text: '坚持第15天了，呼吸明显顺畅了很多',
    likes: 8,
    comments: 3,
    badge: '完美',
    badgeClass: 'silver',
  },
  {
    av: '李',
    user: '李华',
    time: '2小时前',
    text: '分享一个戒烟小技巧：想抽烟时喝杯温水，很有效',
    likes: 15,
    comments: 7,
    badge: '完美',
    badgeClass: 'silver',
  },
])

onLoad((q?: Record<string, string>) => {
  if (q?.name) groupName.value = decodeURIComponent(String(q.name))
  if (q?.icon) groupIcon.value = decodeURIComponent(String(q.icon))
})

function goInvite() {
  const q = `name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent(groupIcon.value)}`
  uni.navigateTo({ url: `/pages/group-invite/group-invite?${q}` })
}

function shareGroup() {
  uni.showToast({ title: '已生成小组邀请链接', icon: 'none' })
}

function goCheckin() {
  const q = `name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent(groupIcon.value)}`
  uni.navigateTo({ url: `/pages/group-checkin-detail/group-checkin-detail?${q}` })
}

function goPost() {
  uni.navigateTo({ url: '/pages/group-post-activity/group-post-activity' })
}

function likeActivity(a: Act) {
  a.likes += 1
}

function commentActivity(a: Act) {
  a.comments += 1
  uni.showToast({ title: '评论已发布', icon: 'success' })
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
  padding: 24rpx 24rpx 40rpx;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.tool-btn {
  font-size: 26rpx;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  border: none;
  color: #fff;
}

.tool-btn.warn {
  background: $color-warn;
}

.tool-btn.primary {
  background: $color-primary;
}

.group-info-section {
  background: #fff;
  padding: 28rpx;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  margin-bottom: 24rpx;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.group-icon.big {
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

.group-details {
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

.group-members {
  font-size: 28rpx;
  color: $color-text-sub;
  display: block;
  margin-bottom: 12rpx;
}

.group-status-pill {
  display: inline-block;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
  background: $color-warn;
  color: #fff;
}

.group-description {
  font-size: 28rpx;
  color: $color-text-sub;
  line-height: 1.6;
  margin-bottom: 24rpx;
  display: block;
}

.group-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background: $color-bg;
  border-radius: 16rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-primary;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $color-text-sub;
}

.checkin-full {
  width: 100%;
  background: $color-primary;
  color: #fff;
  border: none;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.members-section,
.activity-section {
  background: #fff;
  padding: 28rpx;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  margin-bottom: 24rpx;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
}

.section-meta {
  font-size: 24rpx;
  color: $color-text-sub;
}

.activity-head-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.mini-post {
  background: $color-primary;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  border: none;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.member-item {
  text-align: center;
}

.member-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  margin: 0 auto 12rpx;
  position: relative;
}

.vip-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  font-size: 16rpx;
  padding: 2rpx 6rpx;
  border-radius: 8rpx;
  color: #fff;
  font-weight: 600;
}

.vip-badge.sm {
  font-size: 14rpx;
}

.vip-badge.silver {
  background: linear-gradient(45deg, #c0c0c0, #e0e0e0);
}

.vip-badge.gold {
  background: linear-gradient(45deg, #ffd700, #ffec8b);
  color: #333;
}

.vip-badge.rainbow {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
}

.member-name {
  font-size: 24rpx;
  color: $color-text;
  display: block;
}

.member-status {
  font-size: 22rpx;
  color: $color-text-sub;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.activity-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  position: relative;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.activity-user {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.activity-time {
  font-size: 24rpx;
  color: $color-text-sub;
}

.activity-text {
  font-size: 28rpx;
  color: $color-text;
  line-height: 1.5;
  display: block;
  margin-bottom: 12rpx;
}

.activity-actions {
  display: flex;
  gap: 16rpx;
}

.ghost-btn {
  background: #fff;
  color: $color-text-sub;
  border: 1rpx solid #ddd;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}
</style>
