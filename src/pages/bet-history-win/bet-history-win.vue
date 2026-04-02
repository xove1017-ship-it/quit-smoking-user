<template>
  <view class="page">
    <view class="celebrate">
      <view class="confetti" aria-hidden="true">
        <view v-for="n in 18" :key="n" class="c" :style="confStyle(n)" />
      </view>
      <text class="icon">🏆</text>
      <text class="t1">恭喜获胜！</text>
      <text class="t2">您成功完成了7天戒烟挑战</text>
    </view>

    <view class="card">
      <text class="h">两人7天赌约 · 已结束</text>
      <text class="stake">赌注：请看电影</text>
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

    <button class="share" @click="poster = true">分享胜利</button>

    <view v-if="poster" class="mask" @click.self="poster = false">
      <view class="poster">
        <text class="pt">戒烟胜利！</text>
        <text class="pd">李明成功完成7天戒烟挑战</text>
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
  { v: '7', l: '挑战天数' },
  { v: '7', l: '无烟天数' },
  { v: '0', l: '吸烟天数' },
  { v: '100%', l: '成功率' },
]

const posterStats = [
  { v: '7', l: '挑战天数' },
  { v: '100%', l: '成功率' },
  { v: '7', l: '无烟天数' },
  { v: '1', l: '参与人数' },
]

const poster = ref(false)

function confStyle(n: number) {
  const left = (n * 47) % 100
  const delay = (n % 7) * 0.12
  const dur = 2.4 + (n % 5) * 0.15
  return {
    left: left + '%',
    animationDelay: delay + 's',
    animationDuration: dur + 's',
  }
}

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

.celebrate {
  position: relative;
  overflow: hidden;
  padding: 48rpx 32rpx 56rpx;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #1abc9c 0%, #16a085 45%, #27ae60 100%);
}

.confetti {
  pointer-events: none;
  position: absolute;
  inset: 0;
}
.c {
  position: absolute;
  top: -20rpx;
  width: 12rpx;
  height: 20rpx;
  border-radius: 4rpx;
  opacity: 0.9;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  background: rgba(255, 255, 255, 0.85);
}
.c:nth-child(3n) {
  background: #ffeaa7;
}
.c:nth-child(3n + 1) {
  background: #dfe6e9;
}
.c:nth-child(3n + 2) {
  background: #fab1a0;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(520rpx) rotate(360deg);
    opacity: 0.6;
  }
}

.icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 12rpx;
  position: relative;
  z-index: 1;
}
.t1 {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
  position: relative;
  z-index: 1;
}
.t2 {
  font-size: 26rpx;
  opacity: 0.95;
  position: relative;
  z-index: 1;
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
  background: linear-gradient(135deg, #27ae60, #1abc9c);
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
  font-size: 40rpx;
  font-weight: 900;
  color: #27ae60;
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
