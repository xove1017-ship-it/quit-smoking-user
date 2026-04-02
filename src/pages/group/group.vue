<template>
  <view class="page-root">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <view class="page-header">
        <text class="page-title">戒烟小组</text>
        <button class="create-btn" @click="goCreate">创建小组</button>
      </view>

      <view class="group-list">
        <view class="section-header">
          <text class="section-title">👥 我加入的小组</text>
          <view class="section-count">
            <text>{{ joined.length }}个</text>
          </view>
        </view>

        <view
          v-for="(g, idx) in joined"
          :key="'j' + idx"
          class="group-card"
          @click="openGroup(g)"
        >
          <view class="group-header">
            <view class="group-info">
              <view class="group-icon">
                <text>{{ g.icon }}</text>
              </view>
              <view class="group-details">
                <text class="group-name">{{ g.name }}</text>
                <text class="group-members">👥 {{ g.memberCount }}位成员</text>
              </view>
            </view>
            <view class="group-status">
              <text>{{ g.status }}</text>
            </view>
          </view>
          <text class="group-description">{{ g.description }}</text>
          <view class="group-stats">
            <view class="stat-item">
              <text class="stat-value">{{ g.rate }}</text>
              <text class="stat-label">成功率</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ g.todayCheckin }}</text>
              <text class="stat-label">今日打卡</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ g.newMsg }}</text>
              <text class="stat-label">新消息</text>
            </view>
          </view>
        </view>

        <view class="section-header section-gap">
          <text class="section-title">🌟 推荐小组</text>
          <view class="section-count">
            <text>{{ recommended.length }}个</text>
          </view>
        </view>

        <view
          v-for="(g, idx) in recommended"
          :key="'r' + idx"
          class="group-card"
          @click="joinGroup(g)"
        >
          <view class="group-header">
            <view class="group-info">
              <view class="group-icon">
                <text>{{ g.icon }}</text>
              </view>
              <view class="group-details">
                <text class="group-name">{{ g.name }}</text>
                <text class="group-members">👥 {{ g.memberCount }}位成员</text>
              </view>
            </view>
            <view class="group-status status-join">
              <text>可加入</text>
            </view>
          </view>
          <text class="group-description">{{ g.description }}</text>
          <view class="group-stats">
            <view class="stat-item">
              <text class="stat-value">{{ g.rate }}</text>
              <text class="stat-label">成功率</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ g.todayCheckin }}</text>
              <text class="stat-label">今日打卡</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">-</text>
              <text class="stat-label">新消息</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <AppTabBar :active="2" />
  </view>
</template>

<script setup lang="ts">
import AppTabBar from '../../components/AppTabBar.vue'

interface GroupItem {
  id: string
  name: string
  icon: string
  memberCount: number
  status: string
  description: string
  rate: string
  todayCheckin: number
  newMsg: number | string
}

const joined: GroupItem[] = [
  {
    id: '1',
    name: '戒烟互助群',
    icon: '💪',
    memberCount: 28,
    status: '活跃',
    description: '互相监督，共同戒烟！每天分享戒烟心得，互相鼓励支持。',
    rate: '85%',
    todayCheckin: 12,
    newMsg: 3,
  },
  {
    id: '2',
    name: '30天挑战营',
    icon: '🏆',
    memberCount: 15,
    status: '进行中',
    description: '30天无烟挑战，坚持就是胜利！完成挑战可获得专属勋章。',
    rate: '78%',
    todayCheckin: 8,
    newMsg: 0,
  },
  {
    id: '3',
    name: '老烟枪互助会',
    icon: '🚭',
    memberCount: 42,
    status: '活跃',
    description: '专为长期吸烟者设立的互助小组，分享戒烟经验，共同克服烟瘾。',
    rate: '65%',
    todayCheckin: 18,
    newMsg: 5,
  },
]

const recommended: GroupItem[] = [
  {
    id: 'r1',
    name: '新手戒烟营',
    icon: '🌱',
    memberCount: 23,
    status: '可加入',
    description: '专为戒烟新手设计，从零开始学习戒烟技巧，轻松度过戒断期。',
    rate: '92%',
    todayCheckin: 15,
    newMsg: '-',
  },
  {
    id: 'r2',
    name: '健康生活圈',
    icon: '💚',
    memberCount: 56,
    status: '可加入',
    description: '不仅仅是戒烟，更是健康生活方式的转变。分享运动、饮食、心理健康。',
    rate: '88%',
    todayCheckin: 22,
    newMsg: '-',
  },
]

function goCreate() {
  uni.navigateTo({ url: '/pages/group-create/group-create' })
}

function openGroup(g: GroupItem) {
  const q = `name=${encodeURIComponent(g.name)}&icon=${encodeURIComponent(g.icon)}&id=${g.id}`
  uni.navigateTo({ url: `/pages/group-detail/group-detail?${q}` })
}

function joinGroup(g: GroupItem) {
  uni.showModal({
    title: '加入小组',
    content: `确定要加入「${g.name}」吗？`,
    success(res) {
      if (res.confirm) {
        uni.showToast({ title: `已加入${g.name}`, icon: 'success' })
      }
    },
  })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text;
}

.create-btn {
  background: $color-primary;
  color: #fff;
  border: none;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.group-list {
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-gap {
  margin-top: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
}

.section-count {
  font-size: 24rpx;
  color: $color-text-sub;
  background: $color-bg;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
}

.group-card {
  @include card;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
}

.group-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  flex-shrink: 0;
}

.group-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.group-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
}

.group-members {
  font-size: 24rpx;
  color: $color-text-sub;
}

.group-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: $color-warn;
  color: #fff;
  flex-shrink: 0;
}

.group-status.status-join {
  background: $color-primary;
}

.group-description {
  font-size: 28rpx;
  color: $color-text-sub;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.group-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.stat-label {
  font-size: 20rpx;
  color: $color-text-sub;
  margin-top: 4rpx;
}
</style>
