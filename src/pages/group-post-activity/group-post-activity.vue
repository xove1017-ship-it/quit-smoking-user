<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="post-form">
        <view class="form-group">
          <text class="form-label">分享你的戒烟心得</text>
          <textarea
            v-model="content"
            class="form-textarea"
            placeholder="今天戒烟有什么感受？遇到了什么挑战？有什么经验想分享？"
            maxlength="500"
            @input="onInput"
          />
          <text class="char-count" :class="charCountClass">{{ content.length }}/500</text>
        </view>
      </view>

      <view class="emoji-section">
        <text class="section-title">😊 添加表情</text>
        <view class="emoji-grid">
          <view v-for="em in emojis" :key="em" class="emoji-item" @click="addEmoji(em)">
            <text>{{ em }}</text>
          </view>
        </view>
      </view>

      <view class="image-section">
        <text class="section-title">📷 添加图片</text>
        <view v-if="!previewUrl" class="image-upload" @click="chooseImg">
          <text class="upload-icon">📷</text>
          <text class="upload-text">点击上传图片</text>
        </view>
        <view v-else class="image-preview">
          <image class="preview-image" :src="previewUrl" mode="aspectFit" />
          <button class="remove-btn" @click="removeImage">删除图片</button>
        </view>
      </view>

      <button class="post-btn" :disabled="!canPost" @click="postActivity">发布</button>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import groupApi from '@/api/group'

const content = ref('')
const previewUrl = ref('')
const groupId = ref('')

const emojis = ['😊', '👍', '💪', '🎉', '❤️', '🔥', '🌈', '🌟', '🚭', '💯', '✨', '🎯']

const canPost = computed(() => content.value.trim().length > 0 && content.value.length <= 500)

const charCountClass = computed(() => {
  const n = content.value.length
  if (n > 490) return 'error'
  if (n > 450) return 'warning'
  return ''
})

onLoad((q?: Record<string, string>) => {
  if (q?.group_id) groupId.value = String(q.group_id)
})

function onInput() {
  /* v-model 同步 */
}

function addEmoji(em: string) {
  if (content.value.length + em.length > 500) return
  content.value += em
}

function chooseImg() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      const p = res.tempFilePaths[0]
      if (p) previewUrl.value = p
    },
  })
}

function removeImage() {
  previewUrl.value = ''
}

function postActivity() {
  const text = content.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入动态内容', icon: 'none' })
    return
  }
  if (!groupId.value) {
    uni.showToast({ title: '缺少小组，请从小组详情进入', icon: 'none' })
    return
  }
  const images: string[] = []
  if (previewUrl.value?.startsWith('http')) images.push(previewUrl.value)

  groupApi
    .postAdd({ group_id: groupId.value, content: text, images })
    .then(() => {
      uni.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 600)
    })
    .catch(() => {})
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

.post-form,
.emoji-section,
.image-section {
  background: #fff;
  padding: 28rpx;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: $color-text-sub;
  margin-bottom: 16rpx;
}

.form-textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 22rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-top: 8rpx;
}

.char-count.warning {
  color: $color-warn;
}

.char-count.error {
  color: $color-danger;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  display: block;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20rpx;
}

.emoji-item {
  height: 80rpx;
  border-radius: 16rpx;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.image-upload {
  border: 4rpx dashed #ddd;
  border-radius: 16rpx;
  padding: 80rpx 40rpx;
  text-align: center;
}

.upload-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
  color: $color-text-sub;
}

.upload-text {
  font-size: 28rpx;
  color: $color-text-sub;
}

.image-preview {
  text-align: center;
}

.preview-image {
  max-width: 400rpx;
  max-height: 400rpx;
  border-radius: 16rpx;
}

.remove-btn {
  margin-top: 16rpx;
  background: $color-danger;
  color: #fff;
  border: none;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.post-btn {
  width: 100%;
  background: $color-primary;
  color: #fff;
  border: none;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.post-btn[disabled] {
  background: #95a5a6;
}
</style>
