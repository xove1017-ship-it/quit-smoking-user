<template>
  <view class="page">
    <view class="banner">
      <text class="icon">💪</text>
      <text class="t1">再接再厉！</text>
      <text class="t2">虽然挑战失败，但您坚持了12天无烟</text>
    </view>

    <view class="card">
      <text class="h">两人15天赌约 · 已结束</text>
      <text class="stake">赌注：请吃大餐</text>
    </view>

    <view class="card">
      <text class="h">挑战统计</text>
      <view class="stats">
        <view class="s" v-for="(x, i) in stats" :key="i">
          <text class="sn">{{ x.v }}</text>
          <text class="sl">{{ x.l }}</text>
        </view>
      </view>
    </view>

    <button class="share" @click="poster = true">分享经验</button>

    <view v-if="poster" class="mask" @click.self="poster = false">
      <view class="poster">
        <text class="pt">戒烟经验分享</text>
        <text class="pd">李明坚持12天无烟，虽败犹荣</text>
        <view class="p-grid">
          <view class="cell" v-for="(p, i) in posterStats" :key="i">
            <text class="pv">{{ p.v }}</text>
            <text class="pl">{{ p.l }}</text>
          </view>
        </view>
        <view class="p-btns">
          <button class="pb primary" @click="toast('已保存')">保存海报</button>
          <button class="pb outline" @click="toast('已分享')">立即分享</button>
        </view>
        <text class="close" @click="poster = false">关闭</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const stats = [
  { v: '15', l: '挑战天数' },
  { v: '12', l: '无烟天数' },
  { v: '3', l: '吸烟天数' },
  { v: '80%', l: '成功率' },
]

const posterStats = [
  { v: '15', l: '挑战天数' },
  { v: '12', l: '无烟天数' },
  { v: '80%', l: '成功率' },
  { v: '2', l: '参与人数' },
]

const poster = ref(false)

function toast(t: string) {
  uni.showToast({ title: t, icon: 'none' })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 48rpx;
}

.banner {
  padding: 48rpx 32rpx 56rpx;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #e74c3c 0%, #f39c12 100%);
}

.icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 12rpx;
}
.t1 {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}
.t2 {
  font-size: 26rpx;
  opacity: 0.95;
}

.card {
  @include card;
  margin: 24rpx;
  padding: 28rpx;
}
.h {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  color: $color-text;
}
.stake {
  display: block;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-warn;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}
.s {
  background: $color-mint-tint;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}
.sn {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: $color-primary;
}
.sl {
  font-size: 22rpx;
  color: $color-text-sub;
}

.share {
  margin: 0 24rpx;
  width: calc(100% - 48rpx);
  padding: 24rpx;
  border-radius: 18rpx;
  border: none;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.poster {
  @include card;
  width: 100%;
  max-width: 620rpx;
  padding: 40rpx 32rpx;
  text-align: center;
}
.pt {
  display: block;
  font-size: 38rpx;
  font-weight: 900;
  color: $color-warn;
  margin-bottom: 12rpx;
}
.pd {
  display: block;
  font-size: 26rpx;
  color: $color-text-sub;
  margin-bottom: 32rpx;
}
.p-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 32rpx;
}
.cell {
  background: $color-mint-tint;
  border-radius: 16rpx;
  padding: 32rpx 12rpx;
}
.pv {
  display: block;
  font-size: 48rpx;
  font-weight: 900;
  color: $color-primary;
  margin-bottom: 8rpx;
}
.pl {
  font-size: 22rpx;
  color: $color-text-sub;
}
.p-btns {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
}
.pb {
  flex: 1;
  padding: 22rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
  font-weight: 600;
}
.pb.primary {
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  border: none;
}
.pb.outline {
  background: #fff;
  color: $color-primary;
  border: 2rpx solid $color-primary;
}
.close {
  display: block;
  text-align: center;
  color: $color-text-sub;
  font-size: 26rpx;
  padding: 12rpx;
}
</style>
