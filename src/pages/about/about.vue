<template>
  <view class="page">
    <view class="card app-block">
      <text class="emoji">🚭</text>
      <text class="app-name">戒烟小程序</text>
      <text class="ver">版本 {{ versionText }}</text>
      <text class="desc">
        专注于帮助用户成功戒烟的健康管理应用，通过科学的激励机制和社区支持，让戒烟之路不再孤单。
      </text>
    </view>

    <view class="card section">
      <text class="section-title">主要功能</text>
      <view class="info-list">
        <view v-for="(row, i) in features" :key="i" class="info-item">
          <view class="info-icon-wrap">
            <text>{{ row.icon }}</text>
          </view>
          <view class="info-body">
            <text class="info-title">{{ row.t }}</text>
            <text class="info-desc">{{ row.d }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card section">
      <text class="section-title">联系我们</text>
      <view class="info-item">
        <text class="contact-ico">📧</text>
        <text class="contact-txt">邮箱：{{ contactEmail }}</text>
      </view>
      <view class="info-item">
        <text class="contact-ico">📱</text>
        <text class="contact-txt">客服热线：{{ contactHotline }}</text>
      </view>
      <view class="info-item">
        <text class="contact-ico">🌐</text>
        <text class="contact-txt">官方网站：{{ contactWebsite }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import api from '@/utils/api'

const features = [
  { icon: '📊', t: '戒烟记录', d: '详细记录戒烟天数、成功率等数据' },
  { icon: '🎖️', t: '勋章系统', d: '通过勋章激励用户坚持控烟' },
  { icon: '👥', t: '小组互助', d: '加入戒烟小组，互相鼓励支持' },
  { icon: '💰', t: '赌约挑战', d: '通过赌约增加戒烟动力' },
]

const versionText = ref('1.0.0')
const contactEmail = ref('—')
const contactHotline = ref('—')
const contactWebsite = ref('—')

onShow(() => {
  api
    .commonAbout()
    .then((res) => {
      const d = (res.data || {}) as Record<string, unknown>
      if (d.version != null) versionText.value = String(d.version)
      if (d.email != null) contactEmail.value = String(d.email)
      if (d.hotline != null) contactHotline.value = String(d.hotline)
      if (d.website_url != null) contactWebsite.value = String(d.website_url)
    })
    .catch(() => {
      /* 保留默认文案 */
    })
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
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.app-block {
  text-align: center;
}
.emoji {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}
.app-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $color-text;
  margin-bottom: 8rpx;
}
.ver {
  display: block;
  font-size: 26rpx;
  color: $color-text-sub;
  margin-bottom: 20rpx;
}
.desc {
  font-size: 26rpx;
  color: $color-text-sub;
  line-height: 1.65;
  text-align: left;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 20rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: $color-mint-tint;
}

.info-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(26, 188, 156, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.info-body {
  flex: 1;
}

.info-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 4rpx;
}

.info-desc {
  font-size: 22rpx;
  color: $color-text-sub;
}

.contact-ico {
  font-size: 32rpx;
  width: 48rpx;
  text-align: center;
}

.contact-txt {
  flex: 1;
  font-size: 26rpx;
  color: $color-text;
}
</style>
