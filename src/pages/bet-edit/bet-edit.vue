<template>
  <view class="page">
    <view class="card block">
      <text class="block-title">挑战周期</text>
      <text class="label">周期天数</text>
      <picker :range="periods" :value="periodIndex" @change="onPeriod">
        <view class="picker">{{ periods[periodIndex] }}</view>
      </picker>
    </view>

    <view class="card block">
      <text class="block-title">约定</text>
      <text class="label">约定内容</text>
      <input
        v-model="agreement"
        class="input"
        :class="{ focused: focusField === 'agreement' }"
        placeholder="例如：输的人请赢的人吃饭"
        @focus="focusField = 'agreement'"
        @blur="focusField = ''"
      />
      <view class="chips">
        <view
          v-for="(opt, i) in options"
          :key="i"
          class="chip"
          :class="{ selected: agreement === opt.value }"
          @click="pick(opt.value)"
        >
          <text v-if="agreement === opt.value" class="tick">✓</text>
          <text>{{ opt.label }}</text>
        </view>
      </view>
    </view>

    <view class="card block">
      <text class="block-title">其他设置</text>
      <text class="label">每日打卡提醒时间</text>
      <input
        class="input"
        :class="{ focused: focusField === 'time' }"
        type="text"
        v-model="remind"
        @focus="focusField = 'time'"
        @blur="focusField = ''"
      />
    </view>

    <button class="save" @click="save">保存</button>

    <view v-if="showModal" class="mask" @click.self="showModal = false">
      <view class="modal">
        <text class="modal-title">确认保存修改</text>
        <text class="modal-desc">修改内容需要其他参与者同意，确认保存并发送修改请求吗？</text>
        <view class="modal-actions">
          <button class="m-btn ghost" @click="showModal = false">取消</button>
          <button class="m-btn solid" @click="confirm">确认保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const periods = ['7天', '14天', '21天', '30天']
const periodIndex = ref(0)
const agreement = ref('')
const remind = ref('20:00')
const focusField = ref('')
const showModal = ref(false)

const options = [
  { label: '请吃饭', value: '输的人请赢的人吃饭' },
  { label: '帮做事', value: '输的人帮赢的人做一件事' },
  { label: '公开承认', value: '输的人公开承认戒烟成功' },
  { label: '写心得', value: '输的人写戒烟心得分享' },
]

function onPeriod(e: { detail: { value: string } }) {
  periodIndex.value = Number(e.detail.value)
}

function pick(v: string) {
  agreement.value = v
}

function save() {
  showModal.value = true
}

function confirm() {
  if (!agreement.value.trim()) {
    uni.showToast({ title: '请填写约定内容', icon: 'none' })
    return
  }
  showModal.value = false
  uni.navigateTo({ url: '/pages/bet-modify-agree/bet-modify-agree' })
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

.block-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: $color-text;
}

.label {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 12rpx;
}

.picker {
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0e0;
  font-size: 28rpx;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0e0;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.input.focused,
.picker:focus {
  @include focus-ring;
}

.chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.chip {
  position: relative;
  padding: 22rpx 16rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0e0;
  text-align: center;
  font-size: 26rpx;
  color: $color-text;
  transition: all 0.25s ease;
  overflow: hidden;
}

.chip.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.08);
  color: $color-primary;
  font-weight: 600;
}

.tick {
  display: inline-block;
  margin-right: 8rpx;
  animation: tick-pop 0.35s ease;
}

@keyframes tick-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.save {
  width: 100%;
  margin-top: 8rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  border: none;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal {
  @include card;
  width: 100%;
  max-width: 600rpx;
  padding: 36rpx;
}

.modal-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
  color: $color-text;
}

.modal-desc {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: $color-text-sub;
  line-height: 1.55;
  margin-bottom: 28rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.m-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.m-btn.ghost {
  background: $color-bg;
  color: $color-text-sub;
}

.m-btn.solid {
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
}
</style>
