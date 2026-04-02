<template>
  <view class="page">
    <view class="card placeholder">
      <view class="icon-float">
        <text class="ph-icon">👤</text>
      </view>
      <text class="ph-text">账号设置页面正在开发中...</text>
    </view>
    <button class="logout-btn" hover-class="logout-hover" @tap="onLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { clearLoginSession } from "../../utils/auth";

function onLogout() {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        clearLoginSession();
        uni.reLaunch({ url: "/pages/login/login" });
      }
    },
  });
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding: 24rpx;
}

.card {
  @include card;
  padding: 80rpx 40rpx;
  text-align: center;
}

.icon-float {
  margin-bottom: 24rpx;
  animation: float-y 2.6s ease-in-out infinite;
}

.ph-icon {
  font-size: 96rpx;
  display: inline-block;
}

.ph-text {
  font-size: 28rpx;
  color: $color-text-sub;
}

@keyframes float-y {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16rpx);
  }
}

.logout-btn {
  margin: 32rpx 24rpx 0;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: $color-danger;
  background: #fff;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  border: none;
  &::after {
    border: none;
  }
}

.logout-hover {
  opacity: 0.88;
}
</style>
