<template>
  <view class="page">
    <view class="scroll">
      <view class="post-form">
        <view class="form-group">
          <text class="form-label">分享你的戒烟心得</text>
          <textarea
            v-model="content"
            class="form-textarea"
            placeholder="今天戒烟有什么感受？遇到了什么挑战？有什么经验想分享？"
            maxlength="500"
            :adjust-position="true"
            :cursor-spacing="24"
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

      <button class="post-btn" type="button" :disabled="!canPost" @tap="postActivity">发布</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import groupApi from '@/api/group'
import config from '@/config/env'
import { getToken } from '@/utils/auth'

const content = ref('')
const previewUrl = ref('')
const groupId = ref('')

const emojis = ['😊', '👍', '💪', '🎉', '❤️', '🔥', '🌈', '🌟', '🚭', '💯', '✨', '🎯']

/** 本地上传接口（multipart，字段名 file），成功 JSON 同全局 request（code===1，data 含 url/fullurl）；与后端不一致时请改路径 */
const UPLOAD_PATH = '/api/upload'

const canPost = computed(() => {
  const raw = content.value
  if (raw.length > 500) return false
  return !!previewUrl.value || raw.trim().length > 0
})

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

function uploadLocalImage(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${config.basePath}${UPLOAD_PATH}`,
      filePath,
      name: 'file',
      header: {
        'ba-user-token': getToken() || '',
      },
      success(res) {
        if (res.statusCode !== 200) {
          reject(new Error('http'))
          return
        }
        try {
          const j = JSON.parse(res.data as string) as {
            code?: number
            data?: Record<string, unknown> | string
            msg?: string
          }
          if (j.code !== 1) {
            reject(new Error(j.msg || 'upload'))
            return
          }
          const d = j.data
          let url = ''
          if (typeof d === 'string') url = d
          else if (d && typeof d === 'object') {
            url = String(
              (d as { url?: string }).url ??
                (d as { fullurl?: string }).fullurl ??
                (d as { path?: string }).path ??
                '',
            )
          }
          if (!url) {
            reject(new Error('no url'))
            return
          }
          if (!url.startsWith('http')) {
            url = `${config.basePath}${url.startsWith('/') ? '' : '/'}${url}`
          }
          resolve(url)
        } catch (e) {
          reject(e)
        }
      },
      fail: reject,
    })
  })
}

async function postActivity() {
  const text = content.value.trim()
  if (!text && !previewUrl.value) {
    uni.showToast({ title: '请输入文字或选择图片', icon: 'none' })
    return
  }
  if (text.length > 500) {
    uni.showToast({ title: '内容过长', icon: 'none' })
    return
  }
  if (!groupId.value) {
    uni.showToast({ title: '缺少小组，请从小组详情进入', icon: 'none' })
    return
  }
  const images: string[] = []
  if (previewUrl.value) {
    if (previewUrl.value.startsWith('http') || previewUrl.value.startsWith('//')) {
      images.push(previewUrl.value.startsWith('//') ? `https:${previewUrl.value}` : previewUrl.value)
    } else {
      uni.showLoading({ title: '上传中', mask: true })
      try {
        images.push(await uploadLocalImage(previewUrl.value))
      } catch {
        uni.hideLoading()
        uni.showToast({ title: '图片上传失败，请检查上传接口或先发布纯文字', icon: 'none' })
        return
      }
      uni.hideLoading()
    }
  }

  const payload: { group_id: string; content?: string; images?: string[] } = {
    group_id: groupId.value,
  }
  if (text) payload.content = text
  if (images.length) payload.images = images
  if (!payload.content && !payload.images?.length) {
    uni.showToast({ title: '内容与图片至少填一类', icon: 'none' })
    return
  }

  groupApi
    .postAdd(payload)
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
  @include form-page-scroll;
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
  @include form-control-base;
  min-height: 240rpx;
  padding: 20rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  resize: none;
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
