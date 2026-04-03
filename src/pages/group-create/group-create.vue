<template>
  <view class="page">
    <view class="scroll">
      <view class="create-form">
        <view class="form-section">
          <text class="section-title">📋 小组基本信息</text>
          <view class="form-group">
            <text class="form-label">小组名称</text>
            <input
              v-model="groupName"
              class="form-input"
              type="text"
              placeholder="例如：戒烟互助群"
              maxlength="20"
              confirm-type="done"
            />
          </view>
          <view class="form-group">
            <text class="form-label">小组图标</text>
            <view v-if="iconsLoading" class="icon-loading">加载预设图标中…</view>
            <view v-else-if="!iconUrls.length" class="icon-empty">暂无预设图标，可不选封面</view>
            <view v-else class="icon-options">
              <view
                v-for="(url, idx) in iconUrls"
                :key="url + idx"
                class="icon-option"
                :class="{ selected: selectedCoverUrl === url }"
                @tap="selectedCoverUrl = url"
              >
                <image class="icon-img" :src="url" mode="aspectFill" />
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">小组描述</text>
            <textarea
              v-model="groupDescription"
              class="form-textarea"
              placeholder="请简单描述小组的宗旨和目标..."
              :maxlength="500"
              :adjust-position="true"
              :cursor-spacing="24"
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
                <text class="privacy-desc">加入需填写邀请码（创建后由系统生成）</text>
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
          <text class="section-title">👥 创建说明</text>
          <text class="form-tip">
            创建后您将成为小组管理员。私密小组的邀请码由服务端自动生成，无需自填；可在小组详情页复制分享给好友。
          </text>
        </view>
      </view>

      <button class="submit-btn" type="button" :disabled="!canSubmit" @tap="createGroup">
        创建小组
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import groupApi from '@/api/group'
import api from '@/utils/api'

const iconUrls = ref<string[]>([])
const iconsLoading = ref(true)
/** 选中的预设封面 URL，与 POST /quit/group/save 的 cover 一致 */
const selectedCoverUrl = ref('')
const groupName = ref('')
const groupDescription = ref('')
const privacy = ref<'public' | 'private'>('public')

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

const submitting = ref(false)

const canSubmit = computed(() => {
  return !!(
    !submitting.value &&
    !iconsLoading.value &&
    groupName.value.trim() &&
    groupDescription.value.trim() &&
    privacy.value
  )
})

onMounted(() => {
  iconsLoading.value = true
  api
    .groupIcons()
    .then((res) => {
      const list = (res.data as { icons?: string[] } | undefined)?.icons
      iconUrls.value = Array.isArray(list) ? list.filter((u) => typeof u === 'string' && u) : []
      if (iconUrls.value.length && !selectedCoverUrl.value) {
        selectedCoverUrl.value = iconUrls.value[0]
      }
    })
    .catch(() => {})
    .finally(() => {
      iconsLoading.value = false
    })
})

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
  submitting.value = true
  const maxVal = Number(maxOpts[maxIndex.value].value)
  const checkVal = String(checkInOpts[checkIndex.value].value)
  groupApi
    .save({
      name: groupName.value.trim(),
      description: groupDescription.value.trim(),
      visibility: privacy.value,
      max_members: maxVal,
      checkin_rule: checkVal,
      ...(selectedCoverUrl.value ? { cover: selectedCoverUrl.value } : {}),
    })
    .then((res) => {
      const raw = (res.data || {}) as {
        id?: number | string
        visibility?: string
        invite_code?: string | null
      }
      const newId = raw.id != null ? String(raw.id) : ''
      const isPrivate = raw.visibility === 'private' || privacy.value === 'private'
      const code =
        raw.invite_code != null && String(raw.invite_code).trim() !== ''
          ? String(raw.invite_code).trim()
          : ''

      const goDetail = () => {
        const coverQ = selectedCoverUrl.value
          ? `&cover=${encodeURIComponent(selectedCoverUrl.value)}`
          : ''
        const q = newId
          ? `id=${encodeURIComponent(newId)}&name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent('👥')}${coverQ}`
          : `name=${encodeURIComponent(groupName.value)}&icon=${encodeURIComponent('👥')}${coverQ}`
        uni.redirectTo({ url: `/pages/group-detail/group-detail?${q}` })
      }

      if (isPrivate && code) {
        uni.showModal({
          title: '创建成功',
          content: `私密小组邀请码（请妥善保存）：\n${code}`,
          confirmText: '复制邀请码',
          cancelText: '进入小组',
          success(modalRes) {
            if (modalRes.confirm) {
              uni.setClipboardData({
                data: code,
                success() {
                  uni.showToast({ title: '已复制', icon: 'none' })
                  setTimeout(goDetail, 300)
                },
                fail: goDetail,
              })
            } else {
              goDetail()
            }
          },
        })
      } else {
        uni.showToast({ title: '创建成功', icon: 'success' })
        setTimeout(goDetail, 400)
      }
    })
    .catch(() => {})
    .finally(() => {
      submitting.value = false
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
  @include form-control-base;
  padding: 20rpx 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
}

.form-input {
  min-height: 88rpx;
}

.form-textarea {
  min-height: 200rpx;
  resize: none;
}

.icon-loading,
.icon-empty {
  font-size: 26rpx;
  color: $color-text-sub;
  padding: 16rpx 0;
}

.icon-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.icon-option {
  width: 96rpx;
  height: 96rpx;
  justify-self: center;
  border-radius: 50%;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
  overflow: hidden;
  box-sizing: border-box;
}

.icon-img {
  width: 100%;
  height: 100%;
}

.icon-option.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.12);
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
