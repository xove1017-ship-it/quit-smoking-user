<template>
  <view class="page">
    <view class="hero">
      <text class="hero-icon">✏️</text>
      <text class="hero-title">赌约修改请求</text>
      <text class="hero-desc">发起人已提交修改，请核对变更后同意或拒绝</text>
    </view>

    <view class="card">
      <text class="h">变更内容</text>
      <view class="change-item">
        <text class="cl">挑战周期</text>
        <view class="cmp">
          <view class="side old">
            <text class="cv">7天</text>
          </view>
          <text class="arrow">→</text>
          <view class="side new">
            <text class="cv">14天</text>
          </view>
        </view>
      </view>
      <view class="change-item">
        <text class="cl">口头约定</text>
        <view class="cmp">
          <view class="side old">
            <text class="cv line">请吃饭</text>
          </view>
          <text class="arrow">→</text>
          <view class="side new">
            <text class="cv">写心得</text>
          </view>
        </view>
      </view>
    </view>

    <view class="actions">
      <button class="btn primary" @click="agree">同意修改</button>
      <button class="btn ghost" @click="reject">拒绝</button>
    </view>
  </view>
</template>

<script setup lang="ts">
function agree() {
  uni.showToast({ title: '已同意修改', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 500)
}

function reject() {
  uni.showToast({ title: '已拒绝', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 500)
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding: 24rpx;
}

.hero {
  @include card;
  padding: 40rpx 28rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.hero-icon {
  font-size: 72rpx;
  display: block;
  margin-bottom: 12rpx;
}

.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  color: $color-text;
}

.hero-desc {
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

.change-item {
  margin-bottom: 28rpx;
  padding: 24rpx;
  background: $color-bg;
  border-radius: 16rpx;
}

.cl {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 12rpx;
}

.cmp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.side {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border-radius: 12rpx;
}

.side.old {
  background: rgba(231, 76, 60, 0.08);
}

.side.new {
  background: rgba(39, 174, 96, 0.1);
}

.cv {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
}

.cv.line {
  color: $color-danger;
  text-decoration: line-through;
}

.side.new .cv {
  color: #27ae60;
}

.arrow {
  color: $color-warn;
  font-weight: 700;
  font-size: 32rpx;
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
