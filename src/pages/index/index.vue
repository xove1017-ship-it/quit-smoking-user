<template>
  <view class="page-root">
    <!-- 自定义导航页：状态栏 + 与胶囊对齐的导航条高度（微信小程序） -->
    <view class="nav-placeholder" :style="{ height: navInsetPx + 'px' }" />
    <scroll-view
      scroll-y
      class="page-scroll"
      :show-scrollbar="false"
      :style="scrollViewStyle"
    >
    <!-- 顶部欢迎区（与原型 welcome-section 一致） -->
    <view class="welcome-section">
      <view class="welcome-header">
        <text class="welcome-text">{{ greetingText }}</text>
        <view class="day-tag">
          <text>第{{ streak }}天</text>
        </view>
      </view>
      <text class="encouragement">{{ encouragement }}</text>
    </view>

    <!-- 核心数据卡片（上浮叠在欢迎区上） -->
    <view class="data-card">
      <view class="streak-display">
        <text class="streak-number">{{ streak }}</text>
        <text class="streak-unit">天</text>
      </view>
      <text class="stats-info">累计戒烟{{ totalSmokeFreeDays }}天 · 已节省¥{{ savedMoneyYuan }}</text>
      <view class="milestone-progress">
        <view class="progress-label">
          <text>1天</text>
          <text>30天</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress30 + '%' }" />
        </view>
      </view>
    </view>

    <!-- 打卡 -->
    <view class="checkin-section">
      <button class="checkin-btn" @click="onCheckin">
        {{ todayChecked ? '今日已打卡' : '今日无烟打卡' }}
      </button>
    </view>

    <!-- 紧急干预 -->
    <view class="emergency-section">
      <button class="emergency-btn" @click="emergencyOpen = true">
        <text class="emergency-icon">⚡</text>
        <text>想抽烟了？点我冷静一下</text>
        <text>→</text>
      </button>
    </view>

    <!-- 身体变化 · 横向阶段卡 -->
    <view class="module">
      <view class="module-header">
        <text class="module-title">🌱 你的身体正在变好</text>
        <text class="module-sub">{{ stageModuleSub }}</text>
      </view>
      <scroll-view
        v-if="stages.length"
        scroll-x
        class="h-scroll"
        :show-scrollbar="false"
        enable-flex
      >
        <view class="scroll-row">
          <view
            v-for="(s, i) in stages"
            :key="i"
            class="stage-card"
            :class="s.type"
          >
            <view class="stage-header">
              <text class="stage-days">{{ s.days }}天</text>
              <text class="stage-status" :style="s.statusStyle">{{ s.status }}</text>
            </view>
            <text class="stage-title">{{ s.title }}</text>
            <text v-if="s.details" class="stage-details">{{ s.details }}</text>
            <view v-if="s.ring" class="stage-progress">
              <view class="progress-ring">
                <text>{{ s.ring }}</text>
              </view>
              <text class="stage-details">今日完成</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <u-empty
        v-else-if="homeFetched"
        class="module-empty"
        mode="data"
        text="暂无身体恢复阶段数据"
        :iconSize="72"
      />
    </view>

    <!-- 进行中的赌约 -->
    <view class="module">
      <view class="module-header">
        <text class="module-title">🎯 进行中的赌约</text>
        <text class="module-link" @click="goBetList">查看全部</text>
      </view>
      <scroll-view
        v-if="bets.length"
        scroll-x
        class="h-scroll"
        :show-scrollbar="false"
        enable-flex
      >
        <view class="scroll-row">
          <view
            v-for="(b, i) in bets"
            :key="i"
            class="bet-card"
            @click="goBetDetail(b)"
          >
            <view class="bet-header">
              <view class="bet-avatar">
                <text>{{ b.avatar }}</text>
              </view>
              <view class="bet-info">
                <text class="bet-name">{{ b.name }}</text>
                <text class="bet-time">{{ b.time }}</text>
              </view>
            </view>
            <text class="bet-status">{{ b.status }}</text>
            <view class="bet-stake-wrap">
              <text class="bet-stake">{{ b.stake }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <u-empty
        v-else-if="homeFetched"
        class="module-empty"
        mode="order"
        text="暂无进行中的赌约"
        :iconSize="72"
      />
    </view>

    <!-- 戒烟小组 -->
    <view class="module">
      <view class="module-header">
        <text class="module-title">👥 戒烟小组</text>
        <text class="module-link" @click="goGroupList">查看全部</text>
      </view>
      <scroll-view
        v-if="groups.length"
        scroll-x
        class="h-scroll"
        :show-scrollbar="false"
        enable-flex
      >
        <view class="scroll-row">
          <view
            v-for="(g, i) in groups"
            :key="i"
            class="group-card"
            @click="goGroupList"
          >
            <text class="group-name">{{ g.name }}</text>
            <text class="group-stats">{{ g.stats }}</text>
            <view class="group-members">
              <view v-for="m in 3" :key="m" class="member-avatar">
                <text>👤</text>
              </view>
              <view class="member-avatar more">
                <text>{{ g.more }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <u-empty
        v-else-if="homeFetched"
        class="module-empty"
        mode="list"
        text="暂无戒烟小组"
        :iconSize="72"
      />
    </view>

    <!-- 健康里程碑 -->
    <view class="milestone-section">
      <text class="milestone-title">🏆 健康里程碑</text>
      <text class="milestone-desc">戒烟7天，你将获得以下健康改善：</text>
      <view class="milestone-progress-bar">
        <view class="milestone-progress-fill" :style="{ width: milestoneProgressPct + '%' }" />
      </view>
      <text class="milestone-foot">已达成：一氧化碳水平正常化 · 支气管放松</text>
    </view>

    <view class="bottom-spacer" />

  </scroll-view>

    <!-- 紧急干预弹窗 -->
    <view v-if="emergencyOpen" class="modal-mask" @click.self="closeEmergency">
      <view class="modal-content">
        <text class="modal-title">选择应对策略</text>
        <scroll-view scroll-y class="modal-scroll">
          <view
            v-for="opt in strategies"
            :key="opt.id"
            class="strategy-card"
            :class="{ selected: selectedStrategy === opt.id }"
            @click="selectedStrategy = opt.id"
          >
            <view class="strategy-header">
              <text class="strategy-icon">{{ opt.icon }}</text>
              <text class="strategy-title">{{ opt.title }}</text>
            </view>
            <text class="strategy-desc">{{ opt.desc }}</text>
            <view class="strategy-methods">
              <text v-for="(line, idx) in opt.methods" :key="idx" class="method-item">• {{ line }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="modal-buttons">
          <button class="btn btn-secondary" @click="closeEmergency">取消</button>
          <button
            class="btn btn-primary"
            :disabled="!selectedStrategy"
            @click="confirmStrategy"
          >
            开始应对
          </button>
        </view>
      </view>
    </view>

    <AppTabBar :active="0" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppTabBar from '../../components/AppTabBar.vue'
import api from '@/utils/api'

/** 自定义导航栏总占位（px）：状态栏 + 导航条区域，与胶囊按钮垂直居中区域一致 */
function getNavInsetPx(): number {
  const sys = uni.getSystemInfoSync()
  const sb = sys.statusBarHeight || 0
  // #ifdef MP-WEIXIN
  const mb = uni.getMenuButtonBoundingClientRect()
  if (mb.height > 0 && mb.top > 0) {
    return sb + (mb.top - sb) * 2 + mb.height
  }
  // #endif
  return sb + 44
}

const navInsetPx = ref(getNavInsetPx())
const scrollViewStyle = computed(() => ({
  height: `calc(100vh - ${navInsetPx.value}px - 120rpx)`,
  maxHeight: `calc(100vh - ${navInsetPx.value}px - env(safe-area-inset-bottom) - 120rpx)`,
}))

// —— 首页接口 /quit/home/index 映射到页面展示（字段见 module-home-user-common.md）——
const greetingText = ref('加载中…')
const streak = ref(0)
const totalSmokeFreeDays = ref(0)
/** 接口 money_saved_yuan 为字符串小数 */
const savedMoneyYuan = ref('0')
const todayChecked = ref(false)
const stageModuleSub = ref('身体恢复阶段')

const progress30 = computed(() => Math.min(100, (streak.value / 30) * 100))
/** 里程碑条：无专门字段时用连续天数粗算 7 日节点 */
const milestoneProgressPct = computed(() =>
  Math.min(100, Math.max(0, (streak.value / 7) * 100)),
)

const encouragement = computed(() => {
  const d = streak.value
  if (d >= 3) return `坚持${d}天，身体已经开始变化了！`
  return '继续保持，健康每天都在累积！'
})

/** 首页接口已返回过（避免首屏未请求完就显示「暂无」） */
const homeFetched = ref(false)

const stages = ref<any[]>([])

function mapStages(d: any) {
  const raw = d.health_stages
  const cur = Number(d.current_stage_index) || 0
  if (!raw?.length) return []
  return raw.map((item: any, i: number) => {
    const done = i < cur
    const active = i === cur
    return {
      days: item.days || item.label || item.day_range || `${i + 1}阶段`,
      status: done ? '✓' : active ? '进行中' : '即将到来',
      title: item.title || item.name || '',
      details: item.details || item.desc || item.description || '',
      type: done ? 'completed' : active ? 'current' : '',
      statusStyle: { color: done ? '#27AE60' : active ? '#F39C12' : '#5D6D7E' },
      ring: active ? String(item.progress ?? item.ring ?? '100%') : '',
    }
  })
}

function stageSubtitleFrom(d: any) {
  const ns = d.next_stage
  if (typeof ns === 'string' && ns) return ns
  if (ns && typeof ns === 'object') return ns.title || ns.name || stageModuleSub.value
  const idx = d.current_stage_index
  if (idx != null && d.health_stages?.[idx]) {
    const h = d.health_stages[idx]
    return `戒断阶段 · ${h.title || h.name || ''}`.trim()
  }
  return '身体恢复阶段'
}

function mapBets(list: any) {
  if (!list?.length) return []
  return list.map((b: any) => ({
    id: b.id,
    avatar: b.avatar || '👤',
    name: b.name || b.title || '赌约',
    time: b.remain_text || b.time_left || b.time || '',
    status: b.status_text || b.status || '',
    stake: b.stake_text || b.stake || b.reward_text || '',
    solo: Number(b.player_limit) === 1 || !!(b.is_solo ?? b.solo),
  }))
}

function mapGroups(list: any) {
  if (!list?.length) return []
  return list.map((g: any) => ({
    name: g.name || g.title || '小组',
    stats: g.stats || `${g.member_count ?? g.members ?? 0}人 · ${g.active_label || '活跃'}`,
    more: g.more != null ? String(g.more) : g.more_count != null ? `+${g.more_count}` : '+0',
  }))
}

const bets = ref<any[]>([])
const groups = ref<any[]>([])

function applyHomeData(d: any) {
  greetingText.value = d.greeting || greetingText.value
  streak.value = Number(d.streak_days) || 0
  totalSmokeFreeDays.value = Number(d.total_smoke_free_days) || 0
  savedMoneyYuan.value = d.money_saved_yuan != null ? String(d.money_saved_yuan) : '0'
  todayChecked.value = !!d.today_checked
  stageModuleSub.value = stageSubtitleFrom(d)
  stages.value = mapStages(d)
  bets.value = mapBets(d.bets)
  groups.value = mapGroups(d.groups)
  homeFetched.value = true
}

/** 接口失败时用本地时段问候，避免标题一直「加载中」 */
function fallbackGreeting() {
  const h = new Date().getHours()
  const nick = (uni.getStorageSync('quit_smoking_user') as any)?.userInfo?.nickname
  const tail = nick ? `，${nick}` : ''
  if (h >= 5 && h < 12) return '早安' + tail
  if (h >= 12 && h < 18) return '午安' + tail
  return '晚安' + tail
}

/** 拉取首页聚合；进入页面及从后台切回时刷新 */
function loadHome() {
  api.homeIndex().then(
    (res) => applyHomeData(res.data || {}),
    () => {
      greetingText.value = fallbackGreeting()
      stages.value = []
      bets.value = []
      groups.value = []
      homeFetched.value = true
    },
  )
}

onShow(() => {
  loadHome()
})

const emergencyOpen = ref(false)
const selectedStrategy = ref<string | null>(null)

const strategies = [
  {
    id: 'distraction',
    icon: '🎮',
    title: '转移注意力',
    desc: '通过其他活动分散注意力',
    methods: ['玩手机游戏', '听音乐/播客', '做家务/运动'],
  },
  {
    id: 'relaxation',
    icon: '🧘',
    title: '放松技巧',
    desc: '通过放松技巧缓解紧张',
    methods: ['深呼吸练习', '冥想/正念', '温水泡手'],
  },
  {
    id: 'substitution',
    icon: '🍬',
    title: '替代行为',
    desc: '用健康行为替代吸烟',
    methods: ['嚼口香糖', '喝水/茶', '吃水果/零食'],
  },
]

/** 跳转打卡页（原型 原型图/checkin.html） */
function onCheckin() {
  uni.navigateTo({ url: '/pages/checkin/checkin' })
}

function goBetList() {
  uni.reLaunch({ url: '/pages/bet_index/bet_index' })
}

function goGroupList() {
  uni.reLaunch({ url: '/pages/group/group' })
}

function goBetDetail(b: any) {
  if (b?.id == null) {
    uni.navigateTo({ url: '/pages/bet_index/bet_index' })
    return
  }
  const solo = Number(b.player_limit) === 1 || !!b.solo
  const page = solo ? 'bet_detail_solo/bet_detail_solo' : 'bet_detail_multi/bet_detail_multi'
  uni.navigateTo({ url: `/pages/${page}?id=${b.id}` })
}

function closeEmergency() {
  emergencyOpen.value = false
  selectedStrategy.value = null
}

function confirmStrategy() {
  if (!selectedStrategy.value) return
  uni.showToast({ title: '已开始应对，加油！', icon: 'none' })
  closeEmergency()
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page-root {
  min-height: 100vh;
  background: $color-bg;
  position: relative;
}

.page-scroll {
  background: $color-bg;
  box-sizing: border-box;
  padding-bottom: 24rpx;
}

.nav-placeholder {
  flex-shrink: 0;
  width: 100%;
  background: linear-gradient(135deg, $color-primary, #2cab8f);
}

/* 顶部欢迎区（上内边距由 nav-placeholder 承担安全区，此处略收紧） */
.welcome-section {
  background: linear-gradient(135deg, $color-primary, #2cab8f);
  padding: 48rpx 40rpx 80rpx;
  border-radius: 0 0 48rpx 48rpx;
  color: #fff;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.welcome-text {
  font-size: 36rpx;
  font-weight: 600;
}

.day-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.encouragement {
  font-size: 28rpx;
  opacity: 0.92;
  line-height: 1.5;
}

/* 核心数据卡片：叠在欢迎区下方 */
.data-card {
  background: #fff;
  border-radius: 48rpx;
  padding: 48rpx 40rpx 40rpx;
  margin: -40rpx 40rpx 32rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.12);
  text-align: center;
  position: relative;
  z-index: 10;
}

.streak-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 12rpx;
}

.streak-number {
  font-size: 96rpx;
  font-weight: 700;
  color: $color-text;
  line-height: 1;
  font-family: ui-monospace, monospace;
}

.streak-unit {
  font-size: 32rpx;
  color: $color-text-sub;
  margin-left: 8rpx;
}

.stats-info {
  display: block;
  font-size: 28rpx;
  color: $color-text-sub;
  margin-bottom: 32rpx;
}

.milestone-progress {
  margin-top: 8rpx;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 8rpx;
}

.progress-bar {
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

.checkin-section,
.emergency-section {
  padding: 0 40rpx;
  margin-bottom: 32rpx;
}

.checkin-btn {
  width: 100%;
  height: 112rpx;
  line-height: 112rpx;
  background: $color-primary;
  color: #fff;
  border: none;
  border-radius: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(26, 188, 156, 0.3);
}

.emergency-btn {
  width: 100%;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: $color-warn;
  color: #fff;
  border: none;
  border-radius: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(243, 156, 18, 0.35);
}

.emergency-icon {
  font-size: 40rpx;
}

.module {
  margin-bottom: 40rpx;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40rpx;
  margin-bottom: 24rpx;
}

.module-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
}

.module-sub {
  font-size: 28rpx;
  color: $color-text-sub;
}

.module-link {
  font-size: 28rpx;
  color: $color-text-sub;
}

/* 列表无数据时 u-empty 与模块左右对齐 */
.module-empty {
  padding: 8rpx 40rpx 24rpx;
}

.h-scroll {
  width: 100%;
  white-space: nowrap;
}

.scroll-row {
  display: inline-flex;
  flex-direction: row;
  gap: 24rpx;
  padding: 8rpx 40rpx 16rpx;
  box-sizing: border-box;
}

/* 阶段卡 */
.stage-card {
  width: 560rpx;
  flex-shrink: 0;
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  white-space: normal;
}

.stage-card.completed {
  background: rgba(39, 174, 96, 0.1);
  border-left: 8rpx solid #27ae60;
}

.stage-card.current {
  background: $color-bg;
  border-left: 8rpx solid $color-warn;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.stage-days {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.stage-status {
  font-size: 24rpx;
}

.stage-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: $color-text;
  margin-bottom: 16rpx;
}

.stage-details {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  line-height: 1.5;
}

.stage-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
}

.progress-ring {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: conic-gradient($color-primary 100%, $color-bg 0%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: $color-primary;
  font-weight: 600;
}

/* 赌约横滑卡 */
.bet-card {
  width: 400rpx;
  flex-shrink: 0;
  background: $color-bg;
  border-radius: 32rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  white-space: normal;
}

.bet-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.bet-avatar {
  width: 64rpx;
  height: 64rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.bet-info {
  flex: 1;
}

.bet-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.bet-time {
  font-size: 24rpx;
  color: $color-warn;
}

.bet-status {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 8rpx;
}

.bet-stake-wrap {
  background: rgba(255, 255, 255, 0.9);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  display: inline-block;
}

.bet-stake {
  font-size: 24rpx;
  color: $color-text-sub;
}

/* 小组横滑卡 */
.group-card {
  width: 400rpx;
  flex-shrink: 0;
  background: $color-bg;
  border-radius: 32rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  white-space: normal;
}

.group-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  color: $color-text;
}

.group-stats {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 16rpx;
}

.group-members {
  display: flex;
  gap: 8rpx;
}

.member-avatar {
  width: 48rpx;
  height: 48rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.member-avatar.more {
  font-size: 18rpx;
  color: $color-text-sub;
}

/* 健康里程碑 */
.milestone-section {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin: 0 40rpx 48rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.milestone-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  color: $color-text;
}

.milestone-desc {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 24rpx;
}

.milestone-progress-bar {
  height: 12rpx;
  background: $color-bg;
  border-radius: 6rpx;
  overflow: hidden;
}

.milestone-progress-fill {
  height: 100%;
  background: $color-primary;
  border-radius: 6rpx;
}

.milestone-foot {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-top: 16rpx;
  line-height: 1.5;
}

.bottom-spacer {
  height: 24rpx;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-content {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: $color-text;
}

.modal-scroll {
  max-height: 55vh;
  margin-bottom: 24rpx;
}

.strategy-card {
  border: 4rpx solid $color-bg;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  background: #fff;
}

.strategy-card.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.05);
}

.strategy-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.strategy-icon {
  font-size: 40rpx;
}

.strategy-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.strategy-desc {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 12rpx;
}

.strategy-methods {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.method-item {
  font-size: 22rpx;
  color: $color-text-sub;
  line-height: 1.4;
}

.modal-buttons {
  display: flex;
  gap: 24rpx;
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.btn-secondary {
  background: $color-bg;
  color: $color-text-sub;
}

.btn-primary {
  background: $color-primary;
  color: #fff;
}

.btn-primary[disabled] {
  background: #bdc3c7;
  color: #fff;
}
</style>
