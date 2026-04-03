<template>
  <view class="page-root">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <view class="page-header">
        <text class="page-title">戒烟小组</text>
        <button class="create-btn" type="button" @tap="goCreate">创建小组</button>
      </view>

      <view class="tabs">
        <view class="tab-item" :class="{ active: activeTab === 'joined' }" @tap="activeTab = 'joined'">
          <text class="tab-text">我加入的</text>
          <text class="tab-badge">{{ joined.length }}</text>
        </view>
        <view class="tab-item" :class="{ active: activeTab === 'recommended' }" @tap="activeTab = 'recommended'">
          <text class="tab-text">推荐</text>
          <text class="tab-badge">{{ recommended.length }}</text>
        </view>
      </view>

      <view class="group-list">
        <view v-if="loading" class="loading-hint">加载中…</view>

        <template v-else>
          <view v-if="!currentList.length" class="empty-hint">
            <text>{{ activeTab === 'joined' ? '暂无已加入的小组，可去「推荐」看看' : '暂无推荐小组' }}</text>
          </view>

          <view v-for="(g, idx) in currentList" :key="String(g.id ?? idx)" class="group-card" @tap="onCardTap(g)">
            <view class="group-header">
              <view class="group-info">
                <image class="group-icon" :src="g.cover ?? ''" mode="scaleToFill">
                </image>
                <view class="group-details">
                  <text class="group-name">{{ g.name ?? g.title ?? '小组' }}</text>
                  <text class="group-members">
                    👥 {{ g.member_count ?? g.members ?? g.memberCount ?? 0 }}位成员
                  </text>
                </view>
              </view>
              <view class="group-status-wrap">
                <view v-if="isPrivateGroupItem(g)" class="group-pill private">私密</view>
                <view class="group-status" :class="{ 'status-join': activeTab === 'recommended' }">
                  <text>{{ statusLabel(g) }}</text>
                </view>
              </view>
            </view>
            <text class="group-description">{{ g.description ?? g.desc ?? '' }}</text>
            <view class="group-stats">
              <view class="stat-item">
                <text class="stat-value">{{ g.rate != null ? g.rate : '—' }}</text>
                <text class="stat-label">成功率</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ g.today_checkin ?? g.todayCheckin ?? 0 }}</text>
                <text class="stat-label">今日打卡</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ g.new_message_count ?? 0 }}</text>
                <text class="stat-label">新消息</text>
              </view>
            </view>
          </view>
        </template>
      </view>
    </scroll-view>
    <AppTabBar :active="2" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppTabBar from '../../components/AppTabBar.vue'
import groupApi from '@/api/group'

const joined = ref<Record<string, unknown>[]>([])
const recommended = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const activeTab = ref<'joined' | 'recommended'>('joined')

const currentList = computed(() =>
  activeTab.value === 'joined' ? joined.value : recommended.value,
)

function loadGroups() {
  loading.value = true
  Promise.all([
    groupApi.index({ page: 1, limit: 50, type: 'joined' }).then((res) => {
      const list = (res.data as { list?: Record<string, unknown>[] } | undefined)?.list
      joined.value = Array.isArray(list) ? list : []
    }),
    groupApi.index({ page: 1, limit: 50, type: 'recommended' }).then((res) => {
      const list = (res.data as { list?: Record<string, unknown>[] } | undefined)?.list
      recommended.value = Array.isArray(list) ? list : []
    }),
  ])
    .catch(() => { })
    .finally(() => {
      loading.value = false
    })
}

onShow(() => {
  loadGroups()
})

function goCreate() {
  uni.navigateTo({ url: '/pages/group-create/group-create' })
}

function isPrivateGroupItem(g: Record<string, unknown>) {
  return g.visibility === 'private' || g.requires_invite === true
}

/** 推荐列表：私密小组需进详情填邀请码；公开小组可一键确认加入 */
function statusLabel(g: Record<string, unknown>) {
  if (activeTab.value === 'joined') return '已加入'
  return isPrivateGroupItem(g) ? '邀请码加入' : '可加入'
}

function onCardTap(g: Record<string, unknown>) {
  if (activeTab.value === 'joined') {
    openGroup(g)
    return
  }
  if (isPrivateGroupItem(g)) {
    openGroup(g)
    return
  }
  joinGroup(g)
}

function openGroup(g: Record<string, unknown>) {
  const id = String(g.id ?? '')
  const name = String(g.name ?? g.title ?? '小组')
  const q = `name=${encodeURIComponent(name)}&icon=${encodeURIComponent('👥')}&id=${encodeURIComponent(id)}`
  uni.navigateTo({ url: `/pages/group-detail/group-detail?${q}` })
}

function joinGroup(g: Record<string, unknown>) {
  const id = String(g.id ?? '')
  const name = String(g.name ?? g.title ?? '小组')
  uni.showModal({
    title: '加入小组',
    content: `确定要加入「${name}」吗？`,
    success(res) {
      if (!res.confirm) return
      groupApi
        .join(id)
        .then(() => {
          uni.showToast({ title: '加入成功', icon: 'success' })
          activeTab.value = 'joined'
          loadGroups()
        })
        .catch(() => { })
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

.tabs {
  display: flex;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 16rpx;
  position: relative;
  color: $color-text-sub;
  font-size: 30rpx;
}

.tab-item.active {
  color: $color-primary;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 0;
  height: 4rpx;
  border-radius: 4rpx 4rpx 0 0;
  background: $color-primary;
}

.tab-badge {
  font-size: 24rpx;
  color: inherit;
  opacity: 0.85;
}

.group-list {
  padding: 24rpx;
}

.loading-hint,
.empty-hint {
  text-align: center;
  padding: 48rpx 24rpx;
  font-size: 28rpx;
  color: $color-text-sub;
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

.group-status-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  flex-shrink: 0;
}

.group-pill {
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  color: #fff;
}

.group-pill.private {
  background: #8e44ad;
}

.group-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: $color-warn;
  color: #fff;
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
