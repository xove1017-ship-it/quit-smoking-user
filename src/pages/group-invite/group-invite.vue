<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="toolbar-top">
        <button class="send-btn" @click="sendInvites">发送邀请</button>
      </view>

      <view class="invite-content">
        <view class="invite-header">
          <view class="group-icon">
            <text>{{ groupIcon }}</text>
          </view>
          <view class="group-info">
            <text class="group-name">{{ groupName }}</text>
            <text class="group-stats">👥 28位成员 · 85%成功率</text>
          </view>
        </view>
        <view class="invite-message">
          <text class="message-title">💌 邀请消息</text>
          <text class="message-text">
            我正在参加"{{ groupName }}"，这是一个温暖的戒烟社区。大家一起互相监督、分享经验，戒烟成功率高达85%！邀请你一起加入，我们共同战胜烟瘾！
          </text>
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
          <input class="link-input" :value="inviteLink" readonly />
          <button class="copy-btn" @click="copyLink">{{ copyBtnText }}</button>
        </view>
        <text class="link-tip">复制链接发送给好友，点击即可加入小组</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const groupName = ref('戒烟互助群')
const groupIcon = ref('💪')
const inviteLink = ref('https://jq.weixin.com/invite/abc123')
const copyBtnText = ref('复制')

onLoad((q?: Record<string, string>) => {
  if (q?.name) groupName.value = decodeURIComponent(String(q.name))
  if (q?.icon) groupIcon.value = decodeURIComponent(String(q.icon))
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
  height: 100vh;
  box-sizing: border-box;
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
  flex: 1;
  padding: 22rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  font-size: 26rpx;
  background: $color-bg;
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
