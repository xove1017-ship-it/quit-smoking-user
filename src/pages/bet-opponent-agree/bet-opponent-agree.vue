<template>
  <view class="page">
    <view class="invite">
      <view class="avatar">
        <text>李</text>
      </view>
      <text class="name">李明</text>
      <text class="desc">邀请您参与戒烟挑战</text>
    </view>

    <view class="card">
      <text class="h">📋 赌约详情</text>
      <view class="row" v-for="(r, i) in rows" :key="i">
        <text class="k">{{ r.k }}</text>
        <text class="v">{{ r.v }}</text>
      </view>
    </view>

    <view class="actions">
      <button class="btn primary" @click="accept">接受挑战</button>
      <button class="btn ghost" @click="decline">暂不加入</button>
    </view>
  </view>
</template>

<script setup lang="ts">
const rows = [
  { k: '挑战类型：', v: '2人对决' },
  { k: '挑战周期：', v: '7天' },
  { k: '开始时间：', v: '今天开始' },
  { k: '口头约定：', v: '输的人请赢的人吃饭' },
]

function accept() {
  uni.showToast({ title: '已加入赌约', icon: 'success' })
  setTimeout(() => uni.reLaunch({ url: '/pages/bet_index/bet_index' }), 500)
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
  font-size: 56rpx;
  font-weight: 700;
}

.name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  color: $color-text;
}

.desc {
  font-size: 26rpx;
  color: $color-text-sub;
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
  flex-shrink: 0;
}

.v {
  font-weight: 600;
  color: $color-text;
  text-align: right;
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
