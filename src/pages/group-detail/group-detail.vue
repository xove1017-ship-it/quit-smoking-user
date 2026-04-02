<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="toolbar">
        <button class="tool-btn warn" @click="goInvite">邀请</button>
        <button class="tool-btn primary" @click="shareGroup">分享</button>
      </view>

      <view v-if="loading" class="loading-hint">加载中…</view>

      <view v-else class="group-info-section">
        <view class="group-header">
          <view class="group-icon big">
            <image v-if="coverUrl" class="cover-img" :src="coverUrl" mode="aspectFill" />
            <text v-else>{{ groupIcon }}</text>
          </view>
          <view class="group-details">
            <text class="group-name">{{ groupName }}</text>
            <text class="group-members">👥 {{ memberCount }}位成员</text>
            <view v-if="joined" class="group-status-pill ok">
              <text>已加入</text>
            </view>
            <view v-else class="group-status-pill">
              <text>未加入</text>
            </view>
          </view>
        </view>
        <text class="group-description">{{ groupDesc }}</text>
        <view class="group-stats">
          <view class="stat-item">
            <text class="stat-value">{{ statRankLabel }}</text>
            <text class="stat-label">连续天数排名</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ statToday }}</text>
            <text class="stat-label">动态条数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ memberCount }}</text>
            <text class="stat-label">成员数</text>
          </view>
        </view>
        <button class="checkin-full" @click="goCheckin">去今日打卡</button>
      </view>

      <view v-if="!loading" class="members-section">
        <view class="section-title-row">
          <text class="section-title">👥 小组成员</text>
          <text class="section-meta">{{ memberCount }}人 · 按连续无烟天排序</text>
        </view>
        <view v-if="!membersShow.length" class="empty-hint">暂无成员数据</view>
        <view v-else class="members-grid">
          <view v-for="(m, i) in membersShow" :key="i" class="member-item">
            <view class="member-avatar">
              <text>{{ m.av }}</text>
            </view>
            <text class="member-name">{{ m.name }}</text>
            <text class="member-status">{{ m.status }}</text>
          </view>
        </view>
      </view>

      <view v-if="!loading" class="activity-section">
        <view class="section-title-row">
          <text class="section-title">📝 最新动态</text>
          <view class="activity-head-right">
            <text class="section-meta">{{ activities.length }}条</text>
            <button class="mini-post" @click="goPost">发布动态</button>
          </view>
        </view>
        <view v-if="!activities.length" class="empty-hint">暂无动态，打卡后会同步至此</view>
        <view v-else class="activity-list">
          <view v-for="(a, ai) in activities" :key="ai" class="activity-item">
            <view class="activity-avatar">
              <text>{{ a.av }}</text>
            </view>
            <view class="activity-content">
              <view class="activity-header">
                <text class="activity-user">{{ a.user }}</text>
                <text class="activity-time">{{ a.time }}</text>
              </view>
              <text class="activity-text">{{ a.text }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import groupApi from '@/api/group'

const groupId = ref('')
const loading = ref(true)
const groupName = ref('小组')
const groupIcon = ref('👥')
const groupDesc = ref('')
const coverUrl = ref('')
const memberCount = ref(0)
const joined = ref(false)
const statRankLabel = ref('—')
const statToday = ref('—')

interface MemRow {
  av: string
  name: string
  status: string
}

const membersShow = ref<MemRow[]>([])

interface Act {
  av: string
  user: string
  time: string
  text: string
}

const activities = ref<Act[]>([])

function pickAv(n: unknown): string {
  const s = String(n ?? '?').trim()
  return s.slice(0, 1) || '?'
}

function sortMembers(list: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...list].sort(
    (a, b) =>
      Number(b.streak_days ?? b.streak ?? 0) - Number(a.streak_days ?? a.streak ?? 0),
  )
}

function loadDetail() {
  if (!groupId.value) {
    loading.value = false
    return
  }
  loading.value = true
  Promise.all([
    groupApi.detail(groupId.value),
    groupApi.posts({ group_id: groupId.value, page: 1, limit: 30 }),
  ])
    .then(([dRes, pRes]) => {
      const d = (dRes.data || {}) as Record<string, unknown>
      const g = (d.group || {}) as Record<string, unknown>
      groupName.value = String(g.name ?? '小组')
      groupDesc.value = String(g.description ?? g.desc ?? '')
      coverUrl.value = typeof g.cover === 'string' ? g.cover : ''
      memberCount.value = Number(g.member_count ?? g.members ?? 0) || 0
      joined.value = !!d.joined

      const raw = (d.members as Record<string, unknown>[]) || []
      const sorted = sortMembers(raw)
      const topStreak = sorted.length
        ? Number(sorted[0].streak_days ?? sorted[0].streak ?? 0)
        : 0
      statRankLabel.value = topStreak > 0 ? `最高${topStreak}天` : '—'

      membersShow.value = sorted.slice(0, 12).map((m) => ({
        av: pickAv(m.nickname ?? m.name ?? m.user_id),
        name: String(m.nickname ?? m.name ?? '成员'),
        status:
          m.streak_days != null
            ? `连续${m.streak_days}天`
            : m.today_status != null
              ? String(m.today_status)
              : '—',
      }))

      const list = ((pRes.data || {}) as { list?: Record<string, unknown>[] }).list || []
      statToday.value = String(list.length)
      activities.value = list.map((row) => ({
        av: pickAv(row.nickname ?? row.user_name ?? row.uid),
        user: String(row.nickname ?? row.user_name ?? '成员'),
        time: String(row.created_at ?? row.time ?? row.date ?? ''),
        text: String(row.content ?? row.text ?? ''),
      }))
    })
    .catch(() => {
      /* request 已 toast */
    })
    .finally(() => {
      loading.value = false
    })
}

onLoad((q?: Record<string, string>) => {
  if (q?.id) groupId.value = String(q.id)
  if (q?.name) groupName.value = decodeURIComponent(String(q.name))
  if (q?.icon) groupIcon.value = decodeURIComponent(String(q.icon))
})

onShow(() => {
  if (groupId.value) loadDetail()
  else loading.value = false
})

function goInvite() {
  const q = `name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent(groupIcon.value)}`
  uni.navigateTo({ url: `/pages/group-invite/group-invite?${q}` })
}

function shareGroup() {
  uni.showToast({ title: '请使用右上角菜单分享', icon: 'none' })
}

/** 蓝图：全局打卡入口与首页一致，跳转统一打卡页 */
function goCheckin() {
  uni.navigateTo({ url: '/pages/checkin/checkin' })
}

function goPost() {
  if (!groupId.value) {
    uni.showToast({ title: '缺少小组ID', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/group-post-activity/group-post-activity?group_id=${groupId.value}`,
  })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
}

.loading-hint,
.empty-hint {
  text-align: center;
  padding: 32rpx;
  color: $color-text-sub;
  font-size: 28rpx;
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
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
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

.group-status-pill.ok {
  background: $color-primary;
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
  font-size: 32rpx;
  font-weight: 600;
  color: $color-primary;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
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
  flex-wrap: wrap;
  gap: 8rpx;
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
  gap: 16rpx;
}

.activity-user {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.activity-time {
  font-size: 24rpx;
  color: $color-text-sub;
  flex-shrink: 0;
}

.activity-text {
  font-size: 28rpx;
  color: $color-text;
  line-height: 1.5;
  display: block;
  word-break: break-all;
}
</style>
