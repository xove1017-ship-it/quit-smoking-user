<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="toolbar">
        <button class="refresh-btn" type="button" @tap="refresh">🔄</button>
      </view>

      <view v-if="!groupId" class="empty-page">缺少小组参数</view>

      <template v-else>
        <view v-if="loading" class="loading-hint">加载中…</view>
        <template v-else>
        <view v-if="detailError" class="empty-page">无法获取小组信息，请稍后重试</view>
        <view v-else-if="joined === false" class="empty-page">
          组内打卡统计仅对小组成员开放。请先返回小组详情页加入小组后再查看。
        </view>
        <view v-else-if="statsError" class="empty-page">统计数据加载失败，请点击右上角刷新重试</view>
        <view v-else-if="!statsData" class="empty-page">暂无打卡统计数据</view>

        <template v-else>
        <view class="checkin-stats">
          <view class="stats-header">
            <view class="group-icon">
              <image
                v-if="coverSrc(statsData?.group?.cover)"
                class="group-icon-img"
                :src="coverSrc(statsData?.group?.cover)"
                mode="aspectFill"
              />
            </view>
            <view class="group-info">
              <text class="group-name">{{ statsData?.group?.name ?? statsData?.group?.title ?? '小组' }}</text>
              <text class="today-date">统计日 {{ statsData?.date ?? '—' }} · 月 {{ statsData?.month ?? '—' }}</text>
            </view>
          </view>
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-value">{{ numOrDash(statsData?.daily?.checked_count) }}</text>
              <text class="stat-label">今日已打卡</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ numOrDash(statsData?.member_total) }}</text>
              <text class="stat-label">总成员数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ pctOrDash(statsData?.daily?.checkin_rate) }}</text>
              <text class="stat-label">打卡率</text>
            </view>
          </view>
          <view class="stats-grid second">
            <view class="stat-item">
              <text class="stat-value">{{ numOrDash(statsData?.daily?.success_count) }}</text>
              <text class="stat-label">成功控烟</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ numOrDash(statsData?.daily?.fail_count) }}</text>
              <text class="stat-label">没忍住</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ pctOrDash(statsData?.daily?.success_rate) }}</text>
              <text class="stat-label">无烟占比</text>
            </view>
          </view>
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: progressPct(statsData?.daily?.checkin_rate) }"
            />
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
              :class="[
                !cell.day ? 'empty' : cell.base,
                { today: cell.isToday && cell.day > 0 },
              ]"
            >
              <text v-if="cell.day">{{ cell.day }}</text>
            </view>
          </view>
          <view class="calendar-legend">
            <text class="legend-text">✅ 有打卡 · ❌ 无打卡 · 🔵 今日 · 灰为未到来</text>
            <text class="legend-rate">本月平均打卡率：{{ pctOrDash(statsData?.month_avg_checkin_rate) }}</text>
          </view>
        </view>

        <view class="members-section">
          <text class="section-title">👥 今日打卡成员</text>
          <view v-if="!(statsData?.members && statsData.members.length)" class="empty-members">暂无成员数据</view>
          <view v-else class="members-list">
            <view
              v-for="(m, mi) in (statsData?.members || [])"
              :key="String(m.user_id ?? mi)"
              class="member-row"
            >
              <view class="member-avatar">
                <image
                  v-if="coverSrc(m.avatar)"
                  class="member-avatar-img"
                  :src="coverSrc(m.avatar)"
                  mode="aspectFill"
                />
                <text v-else>{{ pickAv(String(m.nickname ?? m.name ?? '?')) }}</text>
              </view>
              <view class="member-info">
                <text class="member-name">{{ m.nickname ?? m.name ?? '成员' }}</text>
                <text class="member-time">{{ memberTimeLine(m) }}</text>
              </view>
              <view class="checkin-status" :class="statusClass(m.checkin_status)">
                <text>{{ m.checkin_status ?? '—' }}</text>
              </view>
            </view>
          </view>
        </view>
        </template>
        </template>
      </template>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import groupApi from '@/api/group'

const groupId = ref('')
const groupIcon = ref('')
const loading = ref(false)
/** 是否为小组成员；仅在 detail 成功返回后有意义 */
const joined = ref<boolean | null>(null)
const detailError = ref(false)
/** 已是成员但 stats 请求失败 */
const statsError = ref(false)
/** GET /quit/group/stats 的 `data`，字段见 module-group.md 4.5.2 */
const statsData = ref<any>(null)

const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

/** 展示用：封面 URL（接口字段 group.cover） */
function coverSrc(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  const t = raw.trim()
  if (!t) return ''
  if (t.startsWith('http')) return t
  if (t.startsWith('//')) return `https:${t}`
  return t
}

function numOrDash(raw: unknown): string {
  if (raw == null || raw === '') return '—'
  return String(raw)
}

function pctOrDash(raw: unknown): string {
  if (raw == null || raw === '') return '—'
  return `${Number(raw).toFixed(1)}%`
}

function progressPct(raw: unknown): string {
  if (raw == null || raw === '') return '0%'
  const pct = Math.min(100, Math.max(0, Number(raw)))
  return `${pct}%`
}

function pickAv(n: string): string {
  const s = n.trim()
  return s.slice(0, 1) || '?'
}

/** 文档：checkin_time 为 H:i 或空；直接展示并拼简短说明 */
function memberTimeLine(m: Record<string, unknown>): string {
  const t = m.checkin_time
  if (t != null && String(t) !== '') return String(t)
  return '未打卡'
}

function statusClass(st: unknown): string {
  const s = String(st ?? '')
  if (s === 'success') return 'checked'
  if (s === 'fail') return 'fail'
  return 'pending'
}

interface CalCell {
  day: number
  base: string
  isToday: boolean
}

const calendarCells = computed((): CalCell[] => {
  const cal = (statsData.value?.calendar || []) as Record<string, unknown>[]
  if (!cal.length) return []
  const monthStr = String(statsData.value?.month ?? '')
  const parts = monthStr.split('-')
  const y = Number(parts[0]) || new Date().getFullYear()
  const mo = Number(parts[1]) || new Date().getMonth() + 1
  const firstDow = new Date(y, mo - 1, 1).getDay()
  const cells: CalCell[] = []
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: 0, base: 'empty', isToday: false })
  }
  for (const row of cal) {
    const day = Number(row.day ?? 0)
    const isFuture = !!row.is_future
    const isToday = !!row.is_today
    const checkedCount = Number(row.checked_count ?? 0)
    let base = 'missed'
    if (isFuture) base = 'future'
    else if (checkedCount > 0) base = 'checked'
    else base = 'missed'
    cells.push({ day, base, isToday })
  }
  return cells
})

/** 先确认是否已加入（与文档一致：stats 仅成员可调），再拉打卡统计 */
async function loadPage() {
  if (!groupId.value) {
    statsData.value = null
    joined.value = null
    return
  }
  loading.value = true
  detailError.value = false
  statsError.value = false
  statsData.value = null
  joined.value = null

  try {
    const dRes = await groupApi.detail(groupId.value)
    const d = (dRes.data || {}) as Record<string, unknown>
    joined.value = !!d.joined

    if (!joined.value) {
      return
    }

    const sRes = await groupApi.stats({ group_id: groupId.value })
    /** 与 module-group.md 4.5.2：`data` 直出，页面绑定 `statsData` */
    statsData.value = sRes.data || {}
  } catch {
    if (joined.value === null) {
      detailError.value = true
    } else if (joined.value === true) {
      statsError.value = true
    }
    statsData.value = null
  } finally {
    loading.value = false
  }
}

onLoad((q?: Record<string, string>) => {
  const id = q?.id ?? q?.group_id
  if (id) groupId.value = String(id)
  if (q?.icon) groupIcon.value = decodeURIComponent(String(q.icon))
})

onShow(() => {
  loadPage()
})

function refresh() {
  loadPage()
  uni.showToast({ title: '已刷新', icon: 'success' })
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

.empty-page,
.loading-hint {
  text-align: center;
  padding: 48rpx;
  font-size: 28rpx;
  color: $color-text-sub;
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
  overflow: hidden;
}

.group-icon-img {
  width: 100%;
  height: 100%;
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

.calendar-day.today.checked {
  background: #27ae60;
  color: #fff;
  border-color: $color-primary;
}

.calendar-day.today.missed {
  background: $color-danger;
  color: #fff;
  border-color: $color-primary;
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

.empty-members {
  text-align: center;
  padding: 32rpx;
  font-size: 28rpx;
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
  overflow: hidden;
}

.member-avatar-img {
  width: 100%;
  height: 100%;
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

.checkin-status.fail {
  background: $color-danger;
  color: #fff;
}
</style>
