<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="create-form">
        <view class="form-section">
          <text class="section-title">📋 小组基本信息</text>
          <view class="form-group">
            <text class="form-label">小组名称</text>
            <input
              v-model="groupName"
              class="form-input"
              placeholder="例如：戒烟互助群"
              maxlength="20"
            />
          </view>
          <view class="form-group">
            <text class="form-label">小组图标</text>
            <view class="icon-options">
              <view
                v-for="ic in icons"
                :key="ic"
                class="icon-option"
                :class="{ selected: selectedIcon === ic }"
                @click="selectIcon(ic)"
              >
                <text>{{ ic }}</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">小组描述</text>
            <textarea
              v-model="groupDescription"
              class="form-textarea"
              placeholder="请简单描述小组的宗旨和目标..."
            />
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">⚙️ 小组设置</text>
          <view class="form-group">
            <text class="form-label">隐私设置</text>
            <view class="privacy-options">
              <view
                class="privacy-option"
                :class="{ selected: privacy === 'public' }"
                @click="privacy = 'public'"
              >
                <text class="privacy-title">公开小组</text>
                <text class="privacy-desc">任何人都可加入</text>
              </view>
              <view
                class="privacy-option"
                :class="{ selected: privacy === 'private' }"
                @click="privacy = 'private'"
              >
                <text class="privacy-title">私密小组</text>
                <text class="privacy-desc">需要邀请加入</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">最大成员数</text>
            <picker :value="maxIndex" :range="maxOpts" range-key="label" @change="onMaxPick">
              <view class="form-input picker-like">{{ maxLabel }}</view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">打卡要求</text>
            <picker :value="checkIndex" :range="checkInOpts" range-key="label" @change="onCheckPick">
              <view class="form-input picker-like">{{ checkLabel }}</view>
            </picker>
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">👥 邀请初始成员</text>
          <view class="form-group">
            <text class="form-label">邀请好友</text>
            <input
              v-model="inviteFriends"
              class="form-input"
              placeholder="输入好友用户名，多个用逗号分隔"
            />
          </view>
          <text class="form-tip">注：创建小组后，您将成为小组管理员，可以管理成员和设置</text>
        </view>
      </view>

      <button class="submit-btn" :disabled="!canSubmit" @click="createGroup">创建小组</button>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const icons = ['💪', '🏆', '🚭', '🌱', '💚', '🌟', '🔥', '🌈']
const selectedIcon = ref('💪')
const groupName = ref('')
const groupDescription = ref('')
const privacy = ref<'public' | 'private'>('public')
const inviteFriends = ref('')

const maxOpts = [
  { value: '20', label: '20人' },
  { value: '50', label: '50人' },
  { value: '100', label: '100人' },
  { value: '200', label: '200人' },
]
const maxIndex = ref(1)
const maxLabel = computed(() => maxOpts[maxIndex.value].label)

const checkInOpts = [
  { value: 'optional', label: '自愿打卡' },
  { value: 'daily', label: '每日打卡' },
  { value: 'weekly', label: '每周打卡' },
]
const checkIndex = ref(1)
const checkLabel = computed(() => checkInOpts[checkIndex.value].label)

const canSubmit = computed(() => {
  return !!(groupName.value.trim() && groupDescription.value.trim() && selectedIcon.value && privacy.value)
})

function selectIcon(ic: string) {
  selectedIcon.value = ic
}

function onMaxPick(e: { detail: { value: string } }) {
  maxIndex.value = Number(e.detail.value)
}

function onCheckPick(e: { detail: { value: string } }) {
  checkIndex.value = Number(e.detail.value)
}

function createGroup() {
  if (!groupName.value.trim()) {
    uni.showToast({ title: '请输入小组名称', icon: 'none' })
    return
  }
  if (!groupDescription.value.trim()) {
    uni.showToast({ title: '请输入小组描述', icon: 'none' })
    return
  }
  uni.showToast({ title: '创建成功', icon: 'success' })
  setTimeout(() => {
    const q = `name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent(selectedIcon.value)}`
    uni.redirectTo({ url: `/pages/group-detail/group-detail?${q}` })
  }, 600)
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

.create-form {
  background: #fff;
  padding: 28rpx;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  margin-bottom: 24rpx;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  display: block;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: $color-text-sub;
  margin-bottom: 16rpx;
}

.form-input,
.form-textarea,
.picker-like {
  width: 100%;
  padding: 22rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 160rpx;
}

.icon-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.icon-option {
  height: 96rpx;
  border-radius: 50%;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  border: 2rpx solid transparent;
}

.icon-option.selected {
  background: $color-primary;
  border-color: $color-primary;
}

.privacy-options {
  display: flex;
  gap: 20rpx;
}

.privacy-option {
  flex: 1;
  padding: 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.privacy-option.selected {
  background: $color-primary;
  border-color: $color-primary;
}

.privacy-option.selected .privacy-title,
.privacy-option.selected .privacy-desc {
  color: #fff;
}

.privacy-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.privacy-desc {
  font-size: 24rpx;
  color: $color-text-sub;
}

.form-tip {
  font-size: 24rpx;
  color: $color-text-sub;
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  background: $color-primary;
  color: #fff;
  border: none;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.submit-btn[disabled] {
  background: #95a5a6;
  opacity: 0.8;
}
</style>
