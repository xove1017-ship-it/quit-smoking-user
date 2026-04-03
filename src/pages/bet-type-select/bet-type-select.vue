<template>
  <view class="page">
    <view class="header">
      <text class="title">选择赌约类型</text>
      <text class="sub">🎯 选择适合您的戒烟挑战方式</text>
    </view>

    <view class="type-selection">
      <view class="type-grid">
        <view
          v-for="t in types"
          :key="t.id"
          class="type-card"
          :class="{ selected: selected === t.id }"
          @click="select(t.id)"
        >
          <text class="type-icon">{{ t.icon }}</text>
          <text class="type-name">{{ t.name }}</text>
          <text class="type-desc">{{ t.desc }}</text>
        </view>
      </view>

      <view v-if="selected === 'custom'" class="custom-section">
        <view class="custom-header">
          <text class="custom-icon">👥</text>
          <text class="custom-title">自定义参与人数</text>
        </view>
        <view class="custom-input">
          <input v-model.number="customN" class="number-input" type="number" />
          <text class="input-label">人</text>
        </view>
      </view>

      <button class="next-btn" :disabled="!selected" @click="next">下一步：设置周期</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const types = [
  { id: 'solo', icon: '👤', name: '单人挑战', desc: '自我监督，专注个人戒烟目标' },
  { id: '2', icon: '👥', name: '2人对决', desc: '一对一竞争，互相监督戒烟' },
  { id: '3', icon: '👨‍👩‍👧', name: '3人小组', desc: '三人成组，团队协作戒烟' },
  { id: 'custom', icon: '🔢', name: '自定义', desc: '自由设定参与人数' },
]

const selected = ref<string>('')
const customN = ref(4)

watch(customN, (v) => {
  let n = Number(v) || 4
  if (n < 4) n = 4
  if (n > 20) n = 20
  customN.value = n
})

function select(id: string) {
  selected.value = id
}

function participants(): number {
  if (selected.value === 'solo') return 1
  if (selected.value === '2') return 2
  if (selected.value === '3') return 3
  if (selected.value === 'custom') return customN.value
  return 1
}

function next() {
  if (!selected.value) return
  uni.setStorageSync('betWizard', {
    type: selected.value,
    participants: participants(),
  })
  uni.navigateTo({ url: '/pages/bet-period-setup/bet-period-setup' })
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 48rpx;
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
  color: $color-text;
  margin-bottom: 8rpx;
}

.sub {
  font-size: 28rpx;
  color: $color-text-sub;
}

.type-selection {
  padding: 32rpx;
}

.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.type-card {
  @include card;
  padding: 32rpx 24rpx;
  text-align: center;
  border: 4rpx solid transparent;
}

.type-card.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.06);
}

.type-icon {
  font-size: 56rpx;
  display: block;
  margin-bottom: 16rpx;
}

.type-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  color: $color-text;
}

.type-desc {
  font-size: 22rpx;
  color: $color-text-sub;
  line-height: 1.45;
}

.custom-section {
  @include card;
  padding: 28rpx;
  margin-bottom: 32rpx;
}

.custom-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.custom-icon {
  font-size: 40rpx;
}

.custom-title {
  font-size: 30rpx;
  font-weight: 600;
}

.custom-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.number-input {
  @include form-control-base;
  flex: 1;
  min-width: 0;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  text-align: center;
  min-height: 88rpx;
}

.input-label {
  font-size: 28rpx;
  color: $color-text-sub;
}

.next-btn {
  width: 100%;
  padding: 28rpx;
  border-radius: 50rpx;
  border: none;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.next-btn[disabled] {
  background: #bdc3c7;
}
</style>
