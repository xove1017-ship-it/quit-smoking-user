<template>
  <view class="page-root">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false" @scrolltolower="onScrollLower">
      <view class="page-header">
        <text class="page-title">戒烟赌约</text>
        <button class="create-btn" @click="goCreate">发起赌约</button>
      </view>

      <view class="tabs">
        <view class="tab" :class="{ on: tab === 0 }" @click="switchTab(0)">
          <text>我的赌约</text>
        </view>
        <view class="tab" :class="{ on: tab === 1 }" @click="switchTab(1)">
          <text>大厅</text>
        </view>
      </view>

      <view v-if="tab === 0" class="bet-list">
        <view class="section-header">
          <text class="section-title">进行与历史</text>
          <text class="section-count">{{ mineTotal }}条</text>
        </view>
        <view v-if="!loadingMine && mineRows.length === 0" class="empty-inline">
          <text>暂无赌约，点击右上角发起</text>
        </view>
        <view
          v-for="item in mineRows"
          :key="'m' + item.id"
          class="bet-card ongoing"
          @click="openDetail(item)"
        >
          <view class="bet-header">
            <view class="bet-opponent">
              <view class="opponent-avatar">
                <text>{{ item.avatar }}</text>
              </view>
              <view class="opponent-info">
                <text class="opponent-name">{{ item.title }}</text>
                <text class="bet-period">{{ item.period }}</text>
              </view>
            </view>
            <view class="bet-status" :class="item.statusClass">
              <text>{{ item.statusText }}</text>
            </view>
          </view>
          <view class="ongoing-details">
            <view class="today-checkin" @click.stop>
              <button
                class="checkin-btn"
                :class="{ checked: item.checked }"
                :disabled="item.checkinDisabled"
                @click.stop="checkinMine(item)"
              >
                {{ item.checkinLabel }}
              </button>
            </view>
            <text class="bet-stake-line">{{ item.stake }}</text>
          </view>
          <view class="progress-section">
            <view class="progress-track">
              <view class="progress-fill" :style="{ width: item.pct + '%' }" />
            </view>
          </view>
        </view>
      </view>

      <view v-else class="bet-list">
        <view class="section-header">
          <text class="section-title">可加入的赌约</text>
          <text class="section-count">{{ hallTotal }}条</text>
        </view>
        <view v-if="!loadingHall && hallRows.length === 0" class="empty-inline">
          <text>大厅暂无进行中的公开赌约</text>
        </view>
        <view v-for="item in hallRows" :key="'h' + item.id" class="bet-card ongoing hall-card">
          <view class="bet-header">
            <view class="bet-opponent">
              <view class="opponent-avatar">
                <text>{{ item.avatar }}</text>
              </view>
              <view class="opponent-info">
                <text class="opponent-name">{{ item.title }}</text>
                <text class="bet-period">{{ item.sub }}</text>
              </view>
            </view>
            <view class="bet-status status-ongoing">
              <text>{{ item.badge }}</text>
            </view>
          </view>
          <text class="bet-stake-line">{{ item.stake }}</text>
          <view class="hall-actions">
            <button class="mini-btn" @click.stop="openDetail(item)">详情</button>
            <button
              v-if="!item.isMine"
              class="mini-btn primary"
              :disabled="item.joining"
              @click.stop="joinHall(item)"
            >
              {{ item.joining ? '加入中…' : '加入' }}
            </button>
          </view>
        </view>
      </view>

      <view class="fab" @click="goCreate">
        <text>+</text>
      </view>
    </scroll-view>
    <AppTabBar :active="1" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppTabBar from '../../components/AppTabBar.vue'
import betApi from '@/api/bet'
import { isSoloByPlayerLimit } from '@/composables/useBetDetail'

interface RowMine {
  id: string | number
  title: string
  avatar: string
  period: string
  statusText: string
  statusClass: string
  stake: string
  checked: boolean
  checkinLabel: string
  checkinDisabled: boolean
  pct: number
  /** player_limit === 1 为单人详情页 */
  solo: boolean
  raw: Record<string, unknown>
}

interface RowHall {
  id: string | number
  title: string
  avatar: string
  sub: string
  stake: string
  badge: string
  isMine: boolean
  joining?: boolean
  solo: boolean
  raw: Record<string, unknown>
}

const tab = ref(0)
const loadingMine = ref(false)
const loadingHall = ref(false)
const mineRows = ref<RowMine[]>([])
const hallRows = ref<RowHall[]>([])
const mineTotal = ref(0)
const hallTotal = ref(0)
const minePage = ref(1)
const hallPage = ref(1)
const mineHasMore = ref(true)
const hallHasMore = ref(true)

function pickAvatar(b: Record<string, unknown>) {
  const c = b.creator as Record<string, unknown> | undefined
  const s = String(c?.nickname || c?.name || b.title || '?')
  return s.slice(0, 1)
}

function formatRemain(sec: unknown) {
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  const d = Math.floor(n / 86400)
  const h = Math.floor((n % 86400) / 3600)
  if (d > 0) return `剩余${d}天`
  if (h > 0) return `剩余${h}小时`
  return '即将结束'
}

function rankHint(h: unknown) {
  const m: Record<string, string> = {
    leading: '领先',
    behind: '落后',
    tied: '持平',
    none: '',
  }
  return m[String(h)] || ''
}

function mapMineItem(b: Record<string, unknown>): RowMine {
  const id = b.id as string | number
  const locked = !!(b as any).today_checked_in || !!(b as any).locked_today
  return {
    id,
    title: String(b.title || b.name || '赌约'),
    avatar: pickAvatar(b),
    period:
      String(b.remain_text || b.period_text || '') ||
      formatRemain(b.remain_seconds) ||
      String(b.status || ''),
    statusText:
      String(b.status_text || '') ||
      rankHint(b.my_rank_hint) ||
      String(b.status || '进行中'),
    statusClass: 'status-ongoing',
    stake: b.stake_text
      ? `赌注：${b.stake_text}`
      : String(b.agreement_text || b.stake || ''),
    checked: locked,
    checkinLabel: locked ? '今日已打卡' : '今日无烟打卡',
    checkinDisabled: locked,
    pct: Math.min(100, Math.max(0, Number(b.progress_percent ?? b.pct) || 0)),
    solo: isSoloByPlayerLimit(b),
    raw: b,
  }
}

function mapHallItem(b: Record<string, unknown>): RowHall {
  const id = b.id as string | number
  const n = Number(b.participant_count ?? b.join_count ?? b.members ?? 0)
  return {
    id,
    title: String(b.title || '赌约'),
    avatar: pickAvatar(b),
    sub: [formatRemain(b.remain_seconds), n ? `${n}人参与` : '']
      .filter(Boolean)
      .join(' · '),
    stake: b.stake_text
      ? `赌注：${b.stake_text}`
      : String(b.agreement_text || ''),
    badge: String(b.status_text || '进行中'),
    isMine: !!(b as any).is_mine,
    solo: isSoloByPlayerLimit(b),
    raw: b,
  }
}

function loadMine(reset: boolean) {
  if (reset) {
    minePage.value = 1
    mineHasMore.value = true
  }
  if (!mineHasMore.value && !reset) return
  loadingMine.value = true
  betApi
    .index({ page: minePage.value, limit: 20 })
    .then((res) => {
      const data = res.data as { list?: Record<string, unknown>[]; total?: number }
      const list = data.list || []
      mineTotal.value = Number(data.total ?? list.length) || 0
      const mapped = list.map(mapMineItem)
      mineRows.value = reset ? mapped : [...mineRows.value, ...mapped]
      if (list.length < 20) mineHasMore.value = false
      else minePage.value += 1
    })
    .finally(() => {
      loadingMine.value = false
    })
}

function loadHall(reset: boolean) {
  if (reset) {
    hallPage.value = 1
    hallHasMore.value = true
  }
  if (!hallHasMore.value && !reset) return
  loadingHall.value = true
  betApi
    .hall({ page: hallPage.value, limit: 20 })
    .then((res) => {
      const data = res.data as { list?: Record<string, unknown>[]; total?: number }
      const list = data.list || []
      hallTotal.value = Number(data.total ?? list.length) || 0
      const mapped = list.map(mapHallItem)
      hallRows.value = reset ? mapped : [...hallRows.value, ...mapped]
      if (list.length < 20) hallHasMore.value = false
      else hallPage.value += 1
    })
    .finally(() => {
      loadingHall.value = false
    })
}

function switchTab(i: number) {
  tab.value = i
  if (i === 0 && mineRows.value.length === 0) loadMine(true)
  if (i === 1 && hallRows.value.length === 0) loadHall(true)
}

function onScrollLower() {
  if (tab.value === 0) loadMine(false)
  else loadHall(false)
}

onShow(() => {
  loadMine(true)
  if (tab.value === 1) loadHall(true)
})

function goCreate() {
  uni.navigateTo({ url: '/pages/bet-type-select/bet-type-select' })
}

function openDetail(item: { id: string | number; solo: boolean }) {
  const page = item.solo ? 'bet_detail_solo/bet_detail_solo' : 'bet_detail_multi/bet_detail_multi'
  uni.navigateTo({ url: `/pages/${page}?id=${item.id}` })
}

async function checkinMine(item: RowMine) {
  if (item.checked || item.checkinDisabled) return
  try {
    await betApi.checkin(item.id, 1)
    item.checked = true
    item.checkinLabel = '今日已打卡'
    item.checkinDisabled = true
    uni.showToast({ title: '打卡成功', icon: 'success' })
  } catch (e: any) {
    if (e?.code === 409 && e?.data?.locked) {
      item.checked = true
      item.checkinLabel = '今日已打卡'
      item.checkinDisabled = true
      uni.showToast({ title: e?.msg || '今日已打卡', icon: 'none' })
    }
  }
}

async function joinHall(item: RowHall) {
  item.joining = true
  try {
    await betApi.join(item.id)
    uni.showToast({ title: '加入成功', icon: 'success' })
    loadHall(true)
    loadMine(true)
  } finally {
    item.joining = false
  }
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
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  border: none;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 16rpx 32rpx 0;
  gap: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.tab {
  padding: 16rpx 8rpx 20rpx;
  font-size: 28rpx;
  color: $color-text-sub;
  border-bottom: 4rpx solid transparent;
}

.tab.on {
  color: $color-primary;
  font-weight: 600;
  border-bottom-color: $color-primary;
}

.bet-list {
  padding: 24rpx;
}

.section-header {
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

.section-count {
  font-size: 24rpx;
  color: $color-text-sub;
  background: $color-bg;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
}

.empty-inline {
  text-align: center;
  padding: 48rpx 24rpx;
  color: $color-text-sub;
  font-size: 28rpx;
}

.bet-card {
  @include card;
  padding: 28rpx;
  margin-bottom: 24rpx;
  border-left: 8rpx solid $color-primary;
}

.bet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.bet-opponent {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.opponent-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.opponent-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.bet-period {
  font-size: 24rpx;
  color: $color-text-sub;
}

.bet-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: $color-bg;
}

.status-ongoing {
  color: $color-warn;
  background: rgba(243, 156, 18, 0.12);
}

.ongoing-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.checkin-btn {
  background: $color-primary;
  color: #fff;
  border: none;
  padding: 10rpx 20rpx;
  border-radius: 32rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.checkin-btn.checked {
  background: #95a5a6;
}

.bet-stake-line {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-warn;
}

.progress-section {
  margin-top: 8rpx;
}

.progress-track {
  height: 8rpx;
  background: $color-bg;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $color-primary;
  border-radius: 4rpx;
}

.hall-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 16rpx;
}

.mini-btn {
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  border: 2rpx solid #e0e0e0;
  background: #fff;
}

.mini-btn.primary {
  border: none;
  background: $color-primary;
  color: #fff;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  font-weight: 300;
  z-index: 400;
  box-shadow: 0 8rpx 28rpx rgba(26, 188, 156, 0.4);
}
</style>
