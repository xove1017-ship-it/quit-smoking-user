<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="toolbar">
        <view class="toolbar-left">
          <button v-if="!joined" class="tool-btn primary" @click="confirmJoin">
            {{ isPrivateGroup ? '验证邀请码并加入' : '加入小组' }}
          </button>
          <button v-else class="tool-btn ghost" @click="confirmLeave">退出小组</button>
        </view>
        <view class="toolbar-right">
          <button class="tool-btn warn" @click="goInvite">邀请</button>
          <button class="tool-btn primary" @click="shareGroup">分享</button>
        </view>
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
            <view class="group-pills">
              <view v-if="isPrivateGroup" class="group-status-pill private">
                <text>私密</text>
              </view>
              <view v-if="joined" class="group-status-pill ok">
                <text>已加入</text>
              </view>
              <view v-else class="group-status-pill">
                <text>未加入</text>
              </view>
            </view>
          </view>
        </view>
        <text class="group-description">{{ groupDesc }}</text>

        <view v-if="joined && adminInviteCode" class="invite-code-banner">
          <text class="invite-code-label">小组邀请码（仅管理员可见）</text>
          <view class="invite-code-row">
            <text class="invite-code-text">{{ adminInviteCode }}</text>
            <button class="invite-copy-btn" type="button" @tap="copyAdminInviteCode">复制</button>
          </view>
          <text class="invite-code-hint">分享给好友，加入私密小组时需填写此邀请码</text>
        </view>

        <view v-if="!joined && isPrivateGroup" class="join-invite-block">
          <text class="join-invite-label">私密小组需填写邀请码</text>
          <input
            v-model="inviteCodeInput"
            class="join-invite-input"
            type="text"
            maxlength="32"
            placeholder="请输入组长提供的邀请码"
            confirm-type="done"
          />
        </view>

        <view class="group-stats">
          <view class="stat-item">
            <text class="stat-value">{{ statSevenDay }}</text>
            <text class="stat-label">七日成功率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ statTodayCheckin }}</text>
            <text class="stat-label">今日打卡人数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ statNewMsg }}</text>
            <text class="stat-label">新消息</text>
          </view>
        </view>
        <button v-if="joined" class="checkin-full" @click="navToGroupCheckin">今日小组打卡</button>
        <view v-else class="checkin-hint">加入小组后可查看组内打卡统计</view>
      </view>

      <view v-if="!loading" class="members-section">
        <view class="section-title-row">
          <text class="section-title">👥 小组成员</text>
          <text class="section-meta">{{ memberCount }}人 · 当日打卡状态</text>
        </view>
        <view v-if="!members.length" class="empty-hint">暂无成员数据</view>
        <view v-else class="members-grid">
          <view
            v-for="(m, i) in members"
            :key="String(m.user_id ?? m.uid ?? i)"
            class="member-item"
          >
            <view class="member-avatar">
              <image
                v-if="memberAvatarUrl(m)"
                class="member-avatar-img"
                :src="memberAvatarUrl(m)"
                mode="aspectFill"
              />
              <text v-else>{{ pickAv(memberName(m)) }}</text>
            </view>
            <text class="member-name">{{ memberName(m) }}</text>
            <text class="member-status">{{ memberStatusLine(m) }}</text>
          </view>
        </view>
      </view>

      <view v-if="!loading" class="activity-section">
        <view class="section-title-row">
          <text class="section-title">📝 最新动态</text>
          <view class="activity-head-right">
            <text class="section-meta">{{ postsTotal }}条</text>
            <button class="mini-post" @click="goPost">发布动态</button>
          </view>
        </view>
        <view v-if="!activities.length" class="empty-hint">暂无动态，打卡后会同步至此</view>
        <view v-else class="activity-list">
          <view v-for="(a, ai) in activities" :key="ai" class="activity-item">
            <view class="activity-avatar">
              <image
                v-if="a.avatarUrl"
                class="activity-avatar-img"
                :src="a.avatarUrl"
                mode="aspectFill"
              />
              <text v-else>{{ a.av }}</text>
            </view>
            <view class="activity-content">
              <view class="activity-header">
                <view class="activity-user-row">
                  <text v-if="a.postTag" class="post-type-tag">{{ a.postTag }}</text>
                  <text class="activity-user">{{ a.user }}</text>
                </view>
                <text class="activity-time">{{ a.time }}</text>
              </view>
              <text v-if="a.text" class="activity-text">{{ a.text }}</text>
              <view v-if="a.images?.length" class="activity-images">
                <image
                  v-for="(img, ii) in a.images"
                  :key="ii"
                  class="activity-thumb"
                  :src="img"
                  mode="aspectFill"
                  @click="previewImg(a.images!, ii)"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
/** 详情接口 `data.stats`，与后端字段一致 */
const stats = ref<Record<string, unknown> | null>(null)
/** 详情接口 `data.members`，后端已排序、限条数 */
const members = ref<Record<string, unknown>[]>([])

/** 来自 `group.visibility` / `requires_invite` */
const groupVisibility = ref<string>('')
const requiresInvite = ref(false)
/** 组长且私密时详情接口返回，用于复制分享 */
const adminInviteCode = ref('')
/** 未加入私密小组时，用户输入的邀请码 */
const inviteCodeInput = ref('')

const isPrivateGroup = computed(() => {
  if (groupVisibility.value === 'private') return true
  return requiresInvite.value === true
})

const statSevenDay = computed(() => {
  const r = stats.value?.seven_day_success_rate
  if (r == null) return '—'
  return `${Number(r).toFixed(1)}%`
})
const statTodayCheckin = computed(() => {
  const n = stats.value?.today_checkin
  return n != null ? String(n) : '—'
})
const statNewMsg = computed(() => {
  const n = stats.value?.new_message_count
  return n != null ? String(n) : '—'
})

interface Act {
  av: string
  user: string
  time: string
  text: string
  images?: string[]
  avatarUrl?: string
  postTag?: string
}

const activities = ref<Act[]>([])
const postsTotal = ref(0)

function pickAv(n: unknown): string {
  const s = String(n ?? '?').trim()
  return s.slice(0, 1) || '?'
}

function memberName(m: Record<string, unknown>) {
  return String(m.nickname ?? m.name ?? '成员')
}

function memberAvatarUrl(m: Record<string, unknown>): string {
  const s = typeof m.avatar === 'string' ? m.avatar.trim() : ''
  if (!s) return ''
  if (s.startsWith('http')) return s
  if (s.startsWith('//')) return `https:${s}`
  return ''
}

/** 展示用：后端已给 today_checkin_status、checkin_time */
function memberStatusLine(m: Record<string, unknown>): string {
  const st = String(m.today_checkin_status ?? '')
  const ti =
    m.checkin_time != null && String(m.checkin_time) !== '' ? String(m.checkin_time) : ''
  if (st === 'success') return ti ? `${ti} · 无烟` : '无烟'
  if (st === 'fail') return ti ? `${ti} · 吸烟` : '吸烟'
  if (st === 'pending') return '待打卡'
  return '—'
}

function postTypeLabel(t: unknown): string {
  const s = String(t ?? '')
  if (s === 'checkin_success') return '打卡'
  if (s === 'checkin_relapse') return '提醒'
  if (s === 'user' || !s) return ''
  return s.length > 4 ? s.slice(0, 4) : s
}

function normalizeImages(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x)).filter((u) => u.startsWith('http') || u.startsWith('//'))
  }
  return []
}

function previewImg(urls: string[], current: number) {
  uni.previewImage({ urls, current: urls[current] })
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

      groupVisibility.value = typeof g.visibility === 'string' ? g.visibility : ''
      requiresInvite.value = g.requires_invite === true
      const codeRaw = g.invite_code
      adminInviteCode.value =
        codeRaw != null && String(codeRaw).trim() !== '' ? String(codeRaw).trim() : ''

      stats.value = d.stats && typeof d.stats === 'object' ? (d.stats as Record<string, unknown>) : null
      members.value = (d.members as Record<string, unknown>[]) || []

      const pData = (pRes.data || {}) as {
        list?: Record<string, unknown>[]
        total?: number
      }
      const list = pData.list || []
      postsTotal.value = pData.total != null ? Number(pData.total) : list.length
      activities.value = list.map((row) => {
        const nick = String(row.nickname ?? row.user_name ?? '成员')
        const avRaw = typeof row.avatar === 'string' ? row.avatar.trim() : ''
        const avatarUrl =
          avRaw && (avRaw.startsWith('http') || avRaw.startsWith('//')) ? avRaw : ''
        const tag = postTypeLabel(row.post_type)
        return {
          av: pickAv(nick),
          avatarUrl,
          user: nick,
          time: String(row.created_at ?? row.time ?? row.date ?? ''),
          text: String(row.content ?? row.text ?? ''),
          images: normalizeImages(row.images),
          postTag: tag,
        }
      })
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
  if (q?.cover) coverUrl.value = decodeURIComponent(String(q.cover))
  const ic = q?.invite_code ?? q?.invite
  if (ic) inviteCodeInput.value = decodeURIComponent(String(ic)).trim()
})

onShow(() => {
  if (groupId.value) loadDetail()
  else loading.value = false
})

function goInvite() {
  const q = `id=${encodeURIComponent(groupId.value)}&name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent(groupIcon.value)}`
  uni.navigateTo({ url: `/pages/group-invite/group-invite?${q}` })
}

function copyAdminInviteCode() {
  if (!adminInviteCode.value) return
  uni.setClipboardData({
    data: adminInviteCode.value,
    success() {
      uni.showToast({ title: '已复制邀请码', icon: 'none' })
    },
  })
}

function confirmJoin() {
  if (!groupId.value) {
    uni.showToast({ title: '缺少小组ID', icon: 'none' })
    return
  }
  if (isPrivateGroup.value) {
    const code = inviteCodeInput.value.trim()
    if (!code) {
      uni.showToast({ title: '私密小组需填写邀请码', icon: 'none' })
      return
    }
    groupApi
      .join(groupId.value, code)
      .then(() => {
        uni.showToast({ title: '已加入', icon: 'success' })
        inviteCodeInput.value = ''
        loadDetail()
      })
      .catch(() => {})
    return
  }
  groupApi
    .join(groupId.value)
    .then(() => {
      uni.showToast({ title: '已加入', icon: 'success' })
      loadDetail()
    })
    .catch(() => {})
}

function confirmLeave() {
  if (!groupId.value) return
  uni.showModal({
    title: '退出小组',
    content: '确定要退出该小组吗？',
    success(res) {
      if (!res.confirm) return
      groupApi
        .leave(groupId.value)
        .then(() => {
          uni.showToast({ title: '已退出', icon: 'success' })
          loadDetail()
        })
        .catch(() => {})
    },
  })
}

function shareGroup() {
  uni.showToast({ title: '请使用右上角菜单分享', icon: 'none' })
}

// 去打卡
function goCheckin() {
  uni.navigateTo({ url: '/pages/checkin/checkin' })
}

function navToGroupCheckin() {
  uni.navigateTo({ url: `/pages/group-checkin-detail/group-checkin-detail?id=${groupId.value}` })
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
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
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

.tool-btn.ghost {
  background: #fff;
  color: $color-text-sub;
  border: 1rpx solid #ddd;
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

.group-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.group-status-pill {
  display: inline-block;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
  background: $color-warn;
  color: #fff;
}

.group-status-pill.private {
  background: #8e44ad;
}

.group-status-pill.ok {
  background: $color-primary;
}

.invite-code-banner {
  background: $color-bg;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.invite-code-label {
  font-size: 24rpx;
  color: $color-text-sub;
  display: block;
  margin-bottom: 12rpx;
}

.invite-code-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.invite-code-text {
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: $color-text;
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.invite-copy-btn {
  flex-shrink: 0;
  background: $color-primary;
  color: #fff;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  border: none;
}

.invite-code-hint {
  font-size: 22rpx;
  color: $color-text-sub;
  margin-top: 12rpx;
  display: block;
  line-height: 1.4;
}

.join-invite-block {
  margin-bottom: 24rpx;
}

.join-invite-label {
  font-size: 26rpx;
  color: $color-text-sub;
  display: block;
  margin-bottom: 12rpx;
}

.join-invite-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 88rpx;
  padding: 20rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  font-size: 30rpx;
  background: #fff;
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

.checkin-hint {
  width: 100%;
  text-align: center;
  font-size: 26rpx;
  color: $color-text-sub;
  padding: 20rpx 16rpx;
  line-height: 1.5;
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
  overflow: hidden;
}

.member-avatar-img {
  width: 100%;
  height: 100%;
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
  overflow: hidden;
}

.activity-avatar-img {
  width: 100%;
  height: 100%;
}

.activity-user-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
  min-width: 0;
}

.post-type-tag {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: $color-bg;
  color: $color-primary;
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

.activity-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.activity-thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: $color-bg;
}
</style>
