<template>
  <view class="page">
    <view class="header">
      <text class="title">设置赌约周期</text>
      <text class="sub">📅 选择挑战时长和开始时间</text>
    </view>

    <view class="body">
      <view class="period-grid">
        <view
          v-for="p in presets"
          :key="p.d"
          class="period-card"
          :class="{ selected: days === p.d }"
          @click="pickPreset(p.d)"
        >
          <text class="period-days">{{ p.d }}天</text>
          <text class="period-label">{{ p.label }}</text>
        </view>
      </view>

      <view class="card-block">
        <view class="row-h">
          <text class="hi">📅</text>
          <text class="ht">开始时间</text>
        </view>
        <view class="date-options">
          <view
            class="date-option"
            :class="{ selected: start === 'today' }"
            @click="start = 'today'"
          >
            <text class="option-label">今天开始</text>
            <text class="option-desc">立即开始挑战</text>
          </view>
          <view
            class="date-option"
            :class="{ selected: start === 'tomorrow' }"
            @click="start = 'tomorrow'"
          >
            <text class="option-label">明天开始</text>
            <text class="option-desc">准备一天</text>
          </view>
        </view>
      </view>

      <view class="btns">
        <button class="prev-btn" @click="back">上一步</button>
        <button class="next-btn" :disabled="!canNext" @click="next">下一步：设置赌注</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const presets = [
  { d: 7, label: '一周挑战' },
  { d: 14, label: '两周挑战' },
  { d: 21, label: '三周挑战' },
  { d: 30, label: '一个月' },
  { d: 60, label: '两个月' },
  { d: 90, label: '三个月' },
]

const days = ref<number | null>(null)
const start = ref<'today' | 'tomorrow' | ''>('')

const canNext = computed(() => !!days.value && (start.value === 'today' || start.value === 'tomorrow'))

function pickPreset(d: number) {
  days.value = d
}

function back() {
  uni.navigateBack()
}

function next() {
  const w = uni.getStorageSync('betWizard') || {}
  uni.setStorageSync('betWizard', {
    ...w,
    periodDays: days.value,
    start: start.value,
  })
  uni.navigateTo({ url: '/pages/bet-stake-setup/bet-stake-setup' })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
}

.header {
  background: #fff;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.sub {
  font-size: 28rpx;
  color: $color-text-sub;
}

.body {
  padding: 32rpx;
}

.period-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.period-card {
  @include card;
  padding: 24rpx 12rpx;
  text-align: center;
  border: 4rpx solid transparent;
}

.period-card.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.06);
}

.period-days {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 4rpx;
}

.period-label {
  font-size: 22rpx;
  color: $color-text-sub;
}

.card-block {
  @include card;
  padding: 28rpx;
  margin-bottom: 32rpx;
}

.row-h {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.hi {
  font-size: 36rpx;
}

.ht {
  font-size: 30rpx;
  font-weight: 600;
}

.date-options {
  display: flex;
  gap: 16rpx;
}

.date-option {
  flex: 1;
  background: $color-bg;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  text-align: center;
}

.date-option.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.06);
}

.option-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.option-desc {
  font-size: 22rpx;
  color: $color-text-sub;
}

.btns {
  display: flex;
  gap: 16rpx;
}

.prev-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 50rpx;
  border: 2rpx solid #e0e0e0;
  background: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.next-btn {
  flex: 2;
  padding: 28rpx;
  border-radius: 50rpx;
  border: none;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.next-btn[disabled] {
  background: #bdc3c7;
}
</style>
