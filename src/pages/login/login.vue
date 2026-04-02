<template>
  <view class="page-root">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <view class="container">
        <view class="header">
          <view class="logo">
            <text class="logo-emoji">🚭</text>
          </view>
          <text class="title">戒烟助手</text>
          <text class="subtitle">健康新生，从戒烟开始</text>
        </view>

        <view class="features card">
          <text class="feature-title">三大核心功能</text>
          <view class="feature-grid">
            <view class="feature-item">
              <view class="feature-icon">
                <text class="fi">📝</text>
              </view>
              <text class="feature-text">{{ f1 }}</text>
            </view>
            <view class="feature-item">
              <view class="feature-icon">
                <text class="fi">⚔️</text>
              </view>
              <text class="feature-text">{{ f2 }}</text>
            </view>
            <view class="feature-item">
              <view class="feature-icon">
                <text class="fi">👥</text>
              </view>
              <text class="feature-text">{{ f3 }}</text>
            </view>
          </view>
        </view>

        <view class="privacy-policy card">
          <text class="policy-title">隐私政策与用户协议</text>
          <scroll-view scroll-y class="policy-content">
            <text class="policy-text">{{ policyText }}</text>
          </scroll-view>
          <view class="checkbox-row" @tap="toggleAgree">
            <view class="check-box" :class="{ on: agreed }">
              <text v-if="agreed" class="check-mark">✓</text>
            </view>
            <text class="check-label">我已阅读并同意用户协议和隐私政策</text>
          </view>
        </view>

        <view class="login-section card">
          <text class="login-title">微信一键登录</text>
          <button
            class="wechat-login-btn"
            :class="{ disabled: loading }"
            :disabled="loading"
            hover-class="wechat-login-btn-hover"
            @tap="onWechatLogin"
          >
            <text class="wechat-icon">{{ loading ? '⏳' : '💚' }}</text>
            <text>{{ loading ? '登录中...' : '微信授权登录' }}</text>
          </button>
          <view class="agreement">
            <text class="agreement-txt">登录即表示同意 </text>
            <text class="link" @tap.stop="openAgreement">用户协议</text>
            <text class="agreement-txt"> 和 </text>
            <text class="link" @tap.stop="openPrivacy">隐私政策</text>
          </view>
        </view>

        <view class="footer">
          <text class="footer-txt">仅限成年人使用 | 健康生活，从戒烟开始</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { isLoggedIn, setLoginSession } from "../../utils/auth";

const f1 = "每日打卡\n记录无烟天数";
const f2 = "戒烟赌约\n与好友PK";
const f3 = "戒烟小组\n互相鼓励";

const policyText =
  "欢迎使用戒烟助手小程序！我们非常重视您的隐私保护。在您使用本小程序前，请仔细阅读以下内容：\n\n" +
  "1. 我们将通过微信授权获取您的昵称和头像信息，用于个性化展示和社交功能。\n" +
  "2. 您的打卡数据、赌约记录等将用于为您提供更好的戒烟服务。\n" +
  "3. 我们承诺不会将您的个人信息用于其他商业用途。\n" +
  "4. 您可以随时在设置中管理您的隐私偏好。\n\n" +
  "继续使用即表示您同意我们的用户协议和隐私政策。";

const agreed = ref(true);
const loading = ref(false);

function toggleAgree() {
  agreed.value = !agreed.value;
}

onShow(() => {
  if (isLoggedIn()) {
    uni.reLaunch({ url: "/pages/index/index" });
  }
});

function openAgreement() {
  uni.navigateTo({ url: "/pages/about/about" });
}

function openPrivacy() {
  uni.navigateTo({ url: "/pages/about/about" });
}

function finishLogin(token: string, extra?: Record<string, unknown>) {
  setLoginSession(token, {
    loginAt: Date.now(),
    ...extra,
  });
  uni.showToast({ title: "登录成功", icon: "success" });
  setTimeout(() => {
    uni.reLaunch({ url: "/pages/index/index" });
  }, 400);
}

function onWechatLogin() {
  if (!agreed.value) {
    uni.showToast({ title: "请先同意用户协议和隐私政策", icon: "none" });
    return;
  }
  if (loading.value) return;
  loading.value = true;

  // #ifdef MP-WEIXIN
  uni.login({
    provider: "weixin",
    success: (res) => {
      if (res.code) {
        // 生产环境：将 res.code 发往服务端换取 session / token
        finishLogin(`wx_${res.code}`, { wxCode: res.code });
      } else {
        uni.showToast({ title: "未获取到登录凭证", icon: "none" });
      }
    },
    fail: (err) => {
      console.error(err);
      uni.showToast({ title: "微信登录失败", icon: "none" });
    },
    complete: () => {
      loading.value = false;
    },
  });
  // #endif

  // #ifndef MP-WEIXIN
  setTimeout(() => {
    finishLogin(`dev_${Date.now()}`, { mock: true });
    loading.value = false;
  }, 800);
  // #endif
}
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.page-root {
  min-height: 100vh;
  background: $color-bg;
}

.page-scroll {
  height: 100vh;
}

.container {
  max-width: 750rpx;
  margin: 0 auto;
  padding: 40rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 48rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  border-radius: 40rpx;
  margin: 0 auto 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-emoji {
  font-size: 64rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: $color-text-sub;
  line-height: 1.4;
}

.card {
  @include card;
  padding: 40rpx;
  margin-bottom: 32rpx;
}

.feature-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 32rpx;
  text-align: center;
}

.feature-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24rpx;
}

.feature-item {
  flex: 1;
  text-align: center;
}

.feature-icon {
  width: 96rpx;
  height: 96rpx;
  background: $color-primary;
  border-radius: 24rpx;
  margin: 0 auto 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fi {
  font-size: 40rpx;
}

.feature-text {
  font-size: 24rpx;
  color: $color-text-sub;
  line-height: 1.35;
  white-space: pre-line;
}

.policy-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: $color-text;
}

.policy-content {
  max-height: 240rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: $color-bg;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.policy-text {
  font-size: 24rpx;
  color: $color-text-sub;
  line-height: 1.5;
}

.checkbox-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}

.check-box {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  border: 2rpx solid #bdc3c7;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  &.on {
    background: $color-primary;
    border-color: $color-primary;
  }
}

.check-mark {
  font-size: 22rpx;
  color: #fff;
  line-height: 1;
}

.check-label {
  flex: 1;
  font-size: 24rpx;
  color: $color-text-sub;
  line-height: 1.4;
}

.login-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32rpx;
  color: $color-text;
}

.wechat-login-btn {
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  padding: 28rpx;
  font-size: 32rpx;
  font-weight: 500;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  line-height: 1.2;

  &::after {
    border: none;
  }

  &.disabled {
    opacity: 0.75;
  }
}

.wechat-login-btn-hover {
  opacity: 0.92;
}

.wechat-icon {
  font-size: 40rpx;
}

.agreement {
  margin-top: 32rpx;
  text-align: center;
  font-size: 24rpx;
  color: $color-text-sub;
  line-height: 1.5;
}

.agreement-txt {
  font-size: 24rpx;
  color: $color-text-sub;
}

.link {
  font-size: 24rpx;
  color: $color-primary;
}

.footer {
  text-align: center;
  padding: 32rpx 0 16rpx;
}

.footer-txt {
  font-size: 24rpx;
  color: $color-text-sub;
}
</style>
