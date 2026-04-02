<template>
  <view class="page">
    <view class="card section">
      <text class="section-title">戒烟成就</text>
      <view v-for="(a, i) in achievementRows" :key="i" class="row">
        <view class="row-icon">{{ a.icon }}</view>
        <view class="row-body">
          <text class="row-title">{{ a.title }}</text>
          <text class="row-desc">{{ a.desc }}</text>
        </view>
        <text class="row-tag">{{ a.state }}</text>
      </view>
    </view>

    <view class="card section">
      <text class="section-title">我的勋章</text>
      <!-- <view class="medals">
        <view v-for="(m, i) in medals" :key="i" class="medal" :class="{ locked: m.locked }">
          <view :class="['medal-graphic', m.kind]">
            <view class="shine" />
          </view>
          <text class="medal-name">{{ m.name }}</text>
          <text class="medal-count">{{ m.count }}</text>
        </view>
      </view> -->
      <view class="medals">
        <view v-for="(m, i) in medalRows" :key="i" class="medal" :class="{ locked: m.locked }">
          <view :class="['medal-graphic', m.kind]">
            <view class="shine" />
          </view>
          <text class="medal-name">{{ m.name }}</text>
          <text class="medal-count">{{ m.count }}</text>
        </view>
      </view>
    </view>

    <view class="card section">
      <text class="section-title">控烟统计</text>
      <view class="stats">
        <view class="stat">
          <text class="stat-num">{{ statMaxStreak }}</text>
          <text class="stat-label">历史最长天数</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ statRate30 }}</text>
          <text class="stat-label">30天成功率</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ statPerfectWeeks }}</text>
          <text class="stat-label">完美周数</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ statGroups }}</text>
          <text class="stat-label">参与小组</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import api from '@/utils/api'
import checkinApi from '@/api/checkin'

const achievementRows = ref<{ icon: string; title: string; desc: string; state: string }[]>([])
const medalRows = ref<{ name: string; count: string; kind: string; locked: boolean }[]>([])

const statMaxStreak = ref('—')
const statRate30 = ref('—')
const statPerfectWeeks = ref('—')
const statGroups = ref('—')

function formatRate30(v: unknown): string {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  const s = n % 1 === 0 ? String(n) : n.toFixed(1)
  return `${s}%`
}

function mapMilestones(list: unknown[]): typeof achievementRows.value {
  return list.slice(0, 20).map((raw) => {
    const m = raw as Record<string, unknown>
    const unlocked = !!(m.unlocked ?? m.is_unlocked)
    return {
      icon: '🔥',
      title: String(m.title ?? m.name ?? '里程碑'),
      desc: String(m.desc ?? m.description ?? ''),
      state: unlocked ? '已达成' : '未达成',
    }
  })
}

function mapMedals(list: unknown[]): typeof medalRows.value {
  return list.slice(0, 12).map((raw) => {
    const m = raw as Record<string, unknown>
    const tier = String(m.tier ?? m.level ?? 'silver')
    const kind = tier === 'rainbow' ? 'rainbow' : tier === 'gold' ? 'gold' : tier === 'silver' ? 'silver' : 'locked'
    const unlocked = !!(m.unlocked ?? m.is_unlocked)
    return {
      name: String(m.title ?? m.name ?? '勋章'),
      count: unlocked ? '已解锁' : '未解锁',
      kind: unlocked ? kind : 'locked',
      locked: !unlocked,
    }
  })
}

function loadPage() {
  Promise.all([api.achievementIndex(), checkinApi.recordStats()])
    .then(([achRes, statsRes]) => {
      const ad = (achRes.data || {}) as Record<string, unknown>
      const milestones = (ad.milestones as unknown[]) || []
      const medals = (ad.medals as unknown[]) || []
      achievementRows.value =
        milestones.length > 0
          ? mapMilestones(milestones)
          : [{ icon: '📭', title: '暂无里程碑数据', desc: '坚持打卡即可解锁', state: '—' }]
      medalRows.value =
        medals.length > 0
          ? mapMedals(medals)
          : [{ name: '暂无勋章', count: '—', kind: 'locked', locked: true }]

      const sd = statsRes.data || {}
      statMaxStreak.value =
        sd.max_historical_streak != null ? `${sd.max_historical_streak}天` : '—'
      statRate30.value = formatRate30(sd.success_rate_30_days)
      statPerfectWeeks.value =
        sd.perfect_weeks != null ? String(sd.perfect_weeks) : '—'
      statGroups.value =
        sd.joined_group_count != null ? String(sd.joined_group_count) : '—'
    })
    .catch(() => {
      /* request 已提示 */
    })
}

onShow(() => {
  loadPage()
})
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding: 24rpx;
  padding-bottom: 48rpx;
}

.card {
  @include card;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 20rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: $color-mint-tint;
  margin-bottom: 16rpx;
}

.row:last-child {
  margin-bottom: 0;
}

.row-icon {
  font-size: 40rpx;
}

.row-body {
  flex: 1;
}

.row-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.row-desc {
  font-size: 22rpx;
  color: $color-text-sub;
}

.row-tag {
  font-size: 22rpx;
  color: $color-primary;
  font-weight: 600;
}

.medals {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.medal {
  width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.medal-lottie-wrap {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lottie-canvas {
  width: 80px;
  height: 80px;
}

.medal.locked .medal-graphic {
  filter: grayscale(1) blur(2px);
  opacity: 0.55;
}

.medal-graphic {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow:
    inset 0 -12rpx 24rpx rgba(0, 0, 0, 0.12),
    0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}



.shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(125deg,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, 0.55) 50%,
      rgba(255, 255, 255, 0) 60%);
  animation: shine-move 3s linear infinite;
}

@keyframes shine-move {
  0% {
    transform: translateX(-60%);
  }

  100% {
    transform: translateX(60%);
  }
}

.medal-name {
  font-size: 24rpx;
  font-weight: 600;
  color: $color-text;
}

.medal-count {
  font-size: 20rpx;
  color: $color-text-sub;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stat {
  background: $color-mint-tint;
  border-radius: 16rpx;
  padding: 28rpx 16rpx;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: $color-primary;
  line-height: 1.2;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $color-text-sub;
}
</style>
