<template>
  <view class="page">
    <view class="invite">
      <view class="avatar">
        <text>见</text>
      </view>
      <text class="name">见证人邀请</text>
      <text class="desc">您被邀请担任本次戒烟赌约的见证人</text>
    </view>

    <view class="card">
      <text class="h">📋 赌约概要</text>
      <view class="row" v-for="(r, i) in rows" :key="i">
        <text class="k">{{ r.k }}</text>
        <text class="v">{{ r.v }}</text>
      </view>
    </view>

    <view class="card">
      <text class="h">见证人职责</text>
      <view v-for="(d, i) in duties" :key="i" class="duty">
        <view class="dot">
          <text>✓</text>
        </view>
        <text class="dt">{{ d }}</text>
      </view>
    </view>

    <view class="actions">
      <button class="btn primary" @click="accept">同意担任见证人</button>
      <button class="btn ghost" @click="decline">暂不担任</button>
    </view>
  </view>
</template>

<script setup lang="ts">
const rows = [
  { k: '参与者：', v: '李明 vs 王强' },
  { k: '周期：', v: '7天' },
  { k: '约定：', v: '请吃火锅' },
]

const duties = ['监督双方按时打卡', '争议时协助沟通', '结束后确认履约情况']

function accept() {
  uni.showToast({ title: '感谢担任见证人', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 500)
}

function decline() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding: 24rpx;
}

.invite {
  @include card;
  padding: 40rpx 28rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin: 0 auto 20rpx;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
}

.name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  color: $color-text;
}

.desc {
  font-size: 26rpx;
  color: $color-text-sub;
  line-height: 1.5;
}

.card {
  @include card;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.h {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  gap: 16rpx;
}

.k {
  color: $color-text-sub;
}

.v {
  font-weight: 600;
  text-align: right;
}

.duty {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
  align-items: flex-start;
}

.dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dt {
  flex: 1;
  font-size: 26rpx;
  color: $color-text;
  line-height: 1.5;
}

.actions .btn {
  width: 100%;
  margin-bottom: 16rpx;
  padding: 26rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.btn.primary {
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
}

.btn.ghost {
  background: $color-bg;
  color: $color-text-sub;
}
</style>
