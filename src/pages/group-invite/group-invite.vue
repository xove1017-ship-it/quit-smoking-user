<template>
  <view class="page">
    <view class="scroll">
      <view class="toolbar-top">
        <button class="send-btn" type="button" @tap="sendInvites">发送邀请</button>
      </view>

      <view class="invite-content">
        <view class="invite-header">
          <view class="group-icon">
            <text>{{ groupIcon }}</text>
          </view>
          <view class="group-info">
            <text class="group-name">{{ groupName }}</text>
            <text class="group-stats">👥 {{ memberCount }}位成员 · 成功率 {{ rateLabel }}</text>
          </view>
        </view>
        <view class="invite-message">
          <text class="message-title">💌 邀请消息</text>
          <text class="message-text">
            我正在参加「{{ groupName }}」互助戒烟（当前 {{ memberCount }} 人，成功率 {{ rateLabel }}）。邀请你一起加入，我们共同战胜烟瘾！
          </text>
        </view>
        <view v-if="inviteCodeDisplay" class="invite-code-box">
          <text class="invite-code-box-title">私密小组邀请码</text>
          <view class="invite-code-box-row">
            <text class="invite-code-box-val">{{ inviteCodeDisplay }}</text>
            <button class="invite-code-box-btn" type="button" @tap="copyInviteCode">复制</button>
          </view>
          <text class="invite-code-box-tip">好友在小组详情页加入时需填写此邀请码</text>
        </view>
      </view>

      <view class="invite-methods">
        <text class="section-title">📤 邀请方式</text>
        <view class="method-list">
          <view class="method-item" @click="tip('已生成微信分享卡片')">
            <view class="method-icon">
              <text>💬</text>
            </view>
            <view class="method-info">
              <text class="method-name">微信好友</text>
              <text class="method-desc">分享给微信好友或群聊</text>
            </view>
          </view>
          <view class="method-item" @click="tip('已生成专属二维码')">
            <view class="method-icon">
              <text>📱</text>
            </view>
            <view class="method-info">
              <text class="method-name">二维码邀请</text>
              <text class="method-desc">生成专属二维码分享</text>
            </view>
          </view>
          <view class="method-item" @click="copyLink">
            <view class="method-icon">
              <text>🔗</text>
            </view>
            <view class="method-info">
              <text class="method-name">链接邀请</text>
              <text class="method-desc">复制邀请链接分享</text>
            </view>
          </view>
          <view class="method-item" @click="tip('打开通讯录选择好友')">
            <view class="method-icon">
              <text>👥</text>
            </view>
            <view class="method-info">
              <text class="method-name">通讯录好友</text>
              <text class="method-desc">从通讯录选择好友</text>
            </view>
          </view>
        </view>
      </view>

      <view class="invite-link-section">
        <text class="section-title">🔗 邀请链接</text>
        <view class="link-container">
          <input class="link-input" type="text" :value="inviteLink" readonly />
          <button class="copy-btn" type="button" @tap="copyLink">{{ copyBtnText }}</button>
        </view>
        <text class="link-tip">复制链接发送给好友，点击即可加入小组</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import groupApi from '@/api/group'

const groupId = ref('')
const groupName = ref('戒烟互助群')
const groupIcon = ref('💪')
const memberCount = ref(0)
const rateLabel = ref('—')
const copyBtnText = ref('复制')
/** 详情接口在组长 + 私密时返回 */
const inviteCodeDisplay = ref('')

/** 小程序内可分享的页面路径（无前导 /） */
const inviteLink = computed(() => {
  const id = groupId.value
  if (id) return `pages/group-detail/group-detail?id=${encodeURIComponent(id)}`
  return 'pages/group/group'
})

function loadDetail() {
  if (!groupId.value) return
  groupApi.detail(groupId.value).then((res) => {
    const d = (res.data || {}) as Record<string, unknown>
    const g = (d.group || {}) as Record<string, unknown>
    groupName.value = String(g.name ?? groupName.value)
    memberCount.value = Number(g.member_count ?? g.members ?? 0) || 0
    rateLabel.value = g.rate != null ? String(g.rate) : '—'
    const ic = g.invite_code
    inviteCodeDisplay.value =
      ic != null && String(ic).trim() !== '' ? String(ic).trim() : ''
  })
}

function copyInviteCode() {
  if (!inviteCodeDisplay.value) return
  uni.setClipboardData({
    data: inviteCodeDisplay.value,
    success() {
      uni.showToast({ title: '已复制邀请码', icon: 'none' })
    },
  })
}

onLoad((q?: Record<string, string>) => {
  if (q?.id) groupId.value = String(q.id)
  if (q?.name) groupName.value = decodeURIComponent(String(q.name))
  if (q?.icon) groupIcon.value = decodeURIComponent(String(q.icon))
})

onShow(() => {
  loadDetail()
})

function tip(msg: string) {
  uni.showToast({ title: msg, icon: 'none' })
}

function sendInvites() {
  uni.showToast({ title: '邀请已发送', icon: 'success' })
}

function copyLink() {
  uni.setClipboardData({
    data: inviteLink.value,
    success() {
      copyBtnText.value = '已复制'
      uni.showToast({ title: '已复制到剪贴板', icon: 'none' })
      setTimeout(() => {
        copyBtnText.value = '复制'
      }, 2000)
    },
  })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
}

.scroll {
  @include form-page-scroll;
  padding: 24rpx;
  padding-bottom: 48rpx;
}

.toolbar-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16rpx;
}

.send-btn {
  background: $color-primary;
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  border: none;
}

.invite-content,
.invite-methods,
.invite-link-section {
  background: #fff;
  padding: 28rpx;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  margin-bottom: 24rpx;
}

.invite-header {
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

.group-stats {
  font-size: 28rpx;
  color: $color-text-sub;
}

.invite-message {
  background: $color-bg;
  padding: 24rpx;
  border-radius: 16rpx;
}

.message-title {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
  color: $color-text;
}

.message-text {
  font-size: 28rpx;
  color: $color-text-sub;
  line-height: 1.5;
}

.invite-code-box {
  margin-top: 24rpx;
  padding: 24rpx;
  background: $color-bg;
  border-radius: 16rpx;
}

.invite-code-box-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $color-text;
  display: block;
  margin-bottom: 12rpx;
}

.invite-code-box-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.invite-code-box-val {
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.invite-code-box-btn {
  flex-shrink: 0;
  background: $color-primary;
  color: #fff;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  border: none;
}

.invite-code-box-tip {
  font-size: 22rpx;
  color: $color-text-sub;
  margin-top: 12rpx;
  display: block;
  line-height: 1.4;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  display: block;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
}

.method-icon {
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

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.method-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.method-desc {
  font-size: 24rpx;
  color: $color-text-sub;
}

.link-container {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
  align-items: stretch;
}

.link-input {
  @include form-control-base;
  flex: 1;
  min-width: 0;
  min-height: 80rpx;
  padding: 16rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  background: $color-bg;
  color: $color-text;
  cursor: default;
  user-select: text;
}

.copy-btn {
  background: $color-primary;
  color: #fff;
  border: none;
  padding: 0 28rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  flex-shrink: 0;
}

.link-tip {
  font-size: 24rpx;
  color: $color-text-sub;
  text-align: center;
  display: block;
}
</style>
