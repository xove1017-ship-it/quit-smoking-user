<template>
  <view class="page">
    <view class="card head">
      <view class="row">
        <view class="av">王</view>
        <view>
          <text class="name">王强</text>
          <text class="sub">7天挑战 · 已结束</text>
        </view>
        <view class="badge ok">挑战成功</view>
      </view>
      <text class="stake">赌注：请吃火锅</text>
    </view>

    <view class="card">
      <text class="h">挑战结果</text>
      <text class="result">恭喜！您成功完成了7天戒烟挑战</text>
      <text class="sub2">王强已兑现约定：请吃火锅</text>
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

    <view class="card">
      <text class="h">打卡时间线</text>
      <view v-for="(row, i) in lines" :key="i" class="tl">
        <view class="axis">
          <view v-if="i < lines.length - 1" class="line" />
          <view class="dot" />
        </view>
        <view class="body">
          <text class="d">第{{ row.day }}天</text>
          <view class="icons">
            <view class="ic ok">✓</view>
            <view class="ic ok">✓</view>
          </view>
          <text class="tm">{{ row.time }}</text>
        </view>
      </view>
    </view>

    <view class="card btns">
      <button class="b1" @click="goWin">查看胜利页样式</button>
      <button class="b2" @click="goLose">查看失败页样式</button>
    </view>
  </view>
</template>

<script setup lang="ts">
const stats = [
  { v: '7', l: '挑战天数' },
  { v: '6', l: '无烟天数' },
  { v: '1', l: '吸烟天数' },
  { v: '85.7%', l: '成功率' },
]

const lines = [
  { day: 7, time: '第7天 18:30' },
  { day: 6, time: '第6天 19:15' },
  { day: 5, time: '第5天 20:00' },
]

function goWin() {
  uni.navigateTo({ url: '/pages/bet-history-win/bet-history-win' })
}
function goLose() {
  uni.navigateTo({ url: '/pages/bet-history-lose/bet-history-lose' })
}
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
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.head .row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}
.av {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
}
.name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}
.sub {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
}
.badge {
  margin-left: auto;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
}
.badge.ok {
  background: #27ae60;
}
.stake {
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-warn;
}

.h {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.result {
  display: block;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 12rpx;
}
.sub2 {
  display: block;
  text-align: center;
  font-size: 26rpx;
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
  font-size: 40rpx;
  font-weight: 800;
  color: $color-primary;
}
.sl {
  font-size: 22rpx;
  color: $color-text-sub;
}

.tl {
  display: flex;
  gap: 16rpx;
  margin-bottom: 8rpx;
}
.axis {
  width: 32rpx;
  position: relative;
  display: flex;
  justify-content: center;
}
.line {
  position: absolute;
  top: 24rpx;
  bottom: -8rpx;
  width: 4rpx;
  background: rgba(26, 188, 156, 0.2);
}
.dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #27ae60;
  margin-top: 8rpx;
  z-index: 1;
}
.body {
  flex: 1;
  background: $color-mint-tint;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.d {
  font-size: 26rpx;
  font-weight: 600;
  color: $color-primary;
  width: 120rpx;
}
.icons {
  flex: 1;
  display: flex;
  gap: 12rpx;
}
.ic {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #fff;
}
.ic.ok {
  background: #27ae60;
}
.tm {
  font-size: 22rpx;
  color: $color-text-sub;
}

.btns {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.b1 {
  padding: 24rpx;
  border-radius: 16rpx;
  border: none;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #27ae60, #1abc9c);
}
.b2 {
  padding: 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid $color-primary;
  color: $color-primary;
  font-size: 28rpx;
  background: #fff;
}
</style>
