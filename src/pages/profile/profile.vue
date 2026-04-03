<template>
  <view class="page">
    <scroll-view scroll-y class="page-scroll" :show-scrollbar="false">
      <!-- 用户信息卡片（与原型 profile.html 一致） -->
      <view class="user-card">
        <view class="user-avatar-wrap">
          <view
            class="user-avatar"
            hover-class="user-avatar-hover"
            @tap="onChangeAvatar"
          >
            <image
              v-if="avatarDisplaySrc"
              class="avatar-img"
              :src="avatarDisplaySrc"
              mode="aspectFill"
            />
            <text v-else class="avatar-emoji">👤</text>
          </view>
          <view class="vip-badge" :class="vipClass">
            <text class="vip-txt">{{ vipLabel }}</text>
          </view>
        </view>

        <view class="user-name-row">
          <text class="user-name">{{ displayName }}</text>
          <view class="edit-icon" hover-class="edit-icon-hover" @tap="openNickEdit">
            <text>✏️</text>
          </view>
        </view>

        <view class="user-level">
          <text>🏆 {{ levelTitle }}</text>
        </view>

        <view class="medals-section">
          <text class="section-title">🎖️ 我的勋章</text>
          <scroll-view scroll-x class="medals-scroll" :show-scrollbar="false" enable-flex>
            <view class="medal-collection">
              <view
                v-for="(m, i) in medals"
                :key="i"
                class="medal-item"
                :class="m.tier"
                @tap="goAchievements"
              >
                <image v-if="m.image" class="medal-img" :src="m.image" mode="aspectFit" />
                <text v-else class="medal-icon">{{ m.icon }}</text>
              </view>
            </view>
          </scroll-view>
          <view class="medal-progress">
            <text class="progress-text">{{ medalProgressHint }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: medalProgressPct + '%' }" />
            </view>
          </view>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" hover-class="menu-item-hover" @tap="go('/pages/account/account')">
          <view class="menu-icon">
            <text>⚙️</text>
          </view>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" hover-class="menu-item-hover" @tap="go('/pages/achievements/achievements')">
          <view class="menu-icon">
            <text>🏅</text>
          </view>
          <text class="menu-text">成就与勋章</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" hover-class="menu-item-hover" @tap="onHelp">
          <view class="menu-icon">
            <text>❓</text>
          </view>
          <text class="menu-text">帮助与反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" hover-class="menu-item-hover" @tap="go('/pages/about/about')">
          <view class="menu-icon">
            <text>ℹ️</text>
          </view>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" hover-class="menu-item-hover" @tap="onInvite">
          <view class="menu-icon">
            <text>👥</text>
          </view>
          <text class="menu-text">邀请好友</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" hover-class="menu-item-hover" @tap="onShare">
          <view class="menu-icon">
            <text>📱</text>
          </view>
          <text class="menu-text">分享应用</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" hover-class="menu-item-hover" @tap="onRate">
          <view class="menu-icon">
            <text>⭐</text>
          </view>
          <text class="menu-text">评价应用</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item menu-item-danger" hover-class="menu-item-hover" @tap="onLogout">
          <view class="menu-icon">
            <text>🚪</text>
          </view>
          <text class="menu-text">退出登录</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <AppTabBar :active="4" />

    <!-- 修改昵称（替代原型的 prompt） -->
    <view v-if="feedbackVisible" class="nick-mask" @tap="closeFeedback">
      <view class="nick-dialog" @tap.stop>
        <text class="nick-dialog-title">意见反馈</text>
        <textarea
          v-model="feedbackDraft"
          class="feedback-area"
          placeholder="请描述问题或建议（2–2000字）"
          maxlength="2000"
        />
        <view class="nick-actions">
          <button class="nick-btn cancel" @tap="closeFeedback">取消</button>
          <button class="nick-btn ok" @tap="submitFeedback">提交</button>
        </view>
      </view>
    </view>

    <view v-if="nickEditVisible" class="nick-mask" @tap="closeNickEdit">
      <view class="nick-dialog" @tap.stop>
        <text class="nick-dialog-title">修改昵称</text>
        <input
          v-model="nickDraft"
          class="nick-input"
          type="nickname"
          maxlength="50"
          placeholder="1～50 个字符，汉字、字母、数字、_、-"
        />
        <view class="nick-actions">
          <button class="nick-btn cancel" @tap="closeNickEdit">取消</button>
          <button class="nick-btn ok" @tap="saveNickname">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppTabBar from "../../components/AppTabBar.vue";
import { clearLoginSession } from "../../utils/auth";
import api from "@/utils/api";
import config from "@/config/env";

const defaultName = "戒烟小能手";
const displayName = ref(defaultName);
/** 接口返回的头像字段（可能为相对路径） */
const avatarUrl = ref("");
const vipLabel = ref("会员");
const vipClass = ref("silver");
const levelTitle = ref("戒烟路上，与你同行");
const medals = ref<{ icon: string; tier: string; image?: string }[]>([
  { icon: "🏅", tier: "silver" },
]);
const medalProgressHint = ref("加载成就数据中…");
const medalProgressPct = ref(0);

const nickEditVisible = ref(false);
const nickDraft = ref("");
const feedbackVisible = ref(false);
const feedbackDraft = ref("");

const avatarDisplaySrc = computed(() => resolveAvatarUrl(avatarUrl.value));

function resolveAvatarUrl(raw: string): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return "";
  if (t.startsWith("http") || t.startsWith("//")) {
    return t.startsWith("//") ? `https:${t}` : t;
  }
  return `${config.basePath}${t.startsWith("/") ? "" : "/"}${t}`;
}

function applyUserProfile(u: Record<string, unknown>) {
  if (u.nickname != null && String(u.nickname).trim() !== "") {
    displayName.value = String(u.nickname).trim();
  }
  if (u.avatar !== undefined && u.avatar !== null) {
    avatarUrl.value = String(u.avatar).trim();
  }
  const vl = String(u.vip_level ?? "none");
  vipLabel.value =
    vl === "rainbow"
      ? "彩虹"
      : vl === "gold"
        ? "黄金"
        : vl === "silver"
          ? "白银"
          : "会员";
  vipClass.value = tierToClass(vl === "none" ? "silver" : vl);
}

function tierToClass(tier: string): string {
  if (tier === "rainbow") return "rainbow";
  if (tier === "gold") return "gold";
  if (tier === "silver") return "silver";
  return "silver";
}

function loadProfileData() {
  Promise.all([api.userProfile(), api.achievementIndex()])
    .then(([userRes, achRes]) => {
      const u = (userRes.data || {}) as Record<string, unknown>;
      applyUserProfile(u);

      const ad = (achRes.data || {}) as Record<string, unknown>;
      const list = (ad.medals as Record<string, unknown>[]) || [];
      const nextPct = Number(ad.next_milestone_progress_percent ?? 0);
      medalProgressPct.value = Math.min(
        100,
        Math.max(0, Number.isFinite(nextPct) ? nextPct : 0),
      );
      const nm = ad.next_milestone as Record<string, unknown> | undefined;
      medalProgressHint.value = nm
        ? `下一里程碑：${nm.title ?? nm.name ?? "继续加油"}`
        : "坚持打卡解锁更多勋章";

      if (list.length) {
        medals.value = list.slice(0, 12).map((m) => {
          const tier = String(m.tier ?? "silver");
          const unlocked = !!(m.unlocked ?? m.is_unlocked ?? true);
          return {
            icon: unlocked ? "🏅" : "🔒",
            tier: unlocked ? tierToClass(tier) : "silver",
            image: typeof m.image === "string" ? m.image : undefined,
          };
        });
      }
    })
    .catch(() => {});
}

onShow(() => {
  loadProfileData();
});

function go(url: string) {
  uni.navigateTo({ url });
}

function goAchievements() {
  uni.navigateTo({ url: "/pages/achievements/achievements" });
}

function openNickEdit() {
  nickDraft.value = displayName.value;
  nickEditVisible.value = true;
}

function closeNickEdit() {
  nickEditVisible.value = false;
}

function saveNickname() {
  const name = nickDraft.value.trim();
  if (!name) {
    uni.showToast({ title: "昵称不能为空", icon: "none" });
    return;
  }
  if (name.length > 50) {
    uni.showToast({ title: "昵称最长 50 个字符", icon: "none" });
    return;
  }
  if (!/^[\u4e00-\u9fa5A-Za-z0-9_-]+$/.test(name)) {
    uni.showToast({ title: "仅支持汉字、字母、数字、_、-", icon: "none" });
    return;
  }
  uni.showLoading({ title: "保存中", mask: true });
  api
    .userProfileSave({ nickname: name })
    .then((res) => {
      applyUserProfile((res.data || {}) as Record<string, unknown>);
      nickEditVisible.value = false;
      uni.showToast({ title: res.msg || "资料更新成功", icon: "success" });
    })
    .catch(() => {})
    .finally(() => {
      uni.hideLoading();
    });
}

function onChangeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success(res) {
      const p = res.tempFilePaths[0];
      if (!p) return;
      uni.showLoading({ title: "上传中", mask: true });
      api
        .uploadMemberFile(p)
        .then((rel) => api.userProfileSave({ avatar: rel }))
        .then((saveRes) => {
          applyUserProfile((saveRes.data || {}) as Record<string, unknown>);
          uni.showToast({ title: saveRes.msg || "资料更新成功", icon: "success" });
        })
        .catch(() => {})
        .finally(() => {
          uni.hideLoading();
        });
    },
  });
}

function onHelp() {
  feedbackDraft.value = "";
  feedbackVisible.value = true;
}

function closeFeedback() {
  feedbackVisible.value = false;
}

function submitFeedback() {
  const content = feedbackDraft.value.trim();
  if (content.length < 2) {
    uni.showToast({ title: "请至少输入2个字", icon: "none" });
    return;
  }
  api
    .feedbackSubmit({ content })
    .then(() => {
      uni.showToast({ title: "感谢反馈", icon: "success" });
      closeFeedback();
    })
    .catch(() => {});
}

function onInvite() {
  uni.showToast({ title: "邀请好友一起戒烟", icon: "none" });
}

function onShare() {
  // #ifdef MP-WEIXIN
  uni.showToast({
    title: "请点击右上角「···」分享给好友",
    icon: "none",
    duration: 2500,
  });
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: "分享应用给朋友", icon: "none" });
  // #endif
}

function onRate() {
  uni.showToast({ title: "感谢支持，请前往应用商店评价", icon: "none" });
}

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
  padding-bottom: env(safe-area-inset-bottom);
}

.page-scroll {
  height: calc(100vh - 120rpx);
  max-height: calc(100vh - env(safe-area-inset-bottom) - 120rpx);
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
}

.bottom-spacer {
  height: 140rpx;
}

.user-card {
  @include card;
  padding: 40rpx 32rpx 36rpx;
  text-align: center;
  margin-bottom: 32rpx;
}

.user-avatar-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 24rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-hover {
  opacity: 0.88;
}

.avatar-emoji {
  font-size: 64rpx;
  color: #fff;
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.vip-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  z-index: 2;
  &.silver {
    background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  }
  &.gold {
    background: linear-gradient(135deg, #fff9c4, #ffb300);
  }
  &.rainbow {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
    background-size: 400% 400%;
    animation: rainbow-shift 2s ease infinite;
  }
}

@keyframes rainbow-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.vip-txt {
  font-size: 18rpx;
  color: #fff;
  font-weight: 700;
}

.user-name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text;
}

.edit-icon {
  padding: 8rpx;
  border-radius: 8rpx;
  opacity: 0.85;
}

.edit-icon-hover {
  opacity: 1;
  background: rgba(26, 188, 156, 0.12);
}

.user-level {
  display: inline-block;
  font-size: 24rpx;
  color: $color-warn;
  background: rgba(243, 156, 18, 0.1);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  margin-bottom: 8rpx;
}

.medals-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: $color-mint-tint;
  border-radius: 24rpx;
  text-align: left;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: $color-text;
}

.medals-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.medal-collection {
  display: inline-flex;
  flex-direction: row;
  gap: 16rpx;
  padding: 4rpx 0 8rpx;
}

.medal-item {
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  border: 4rpx solid;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &.silver {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-color: #c0c0c0;
  }
  &.gold {
    background: linear-gradient(135deg, #fff9c4, #ffecb3);
    border-color: #ffd700;
  }
  &.rainbow {
    background: linear-gradient(135deg, #ffeaa7, #fdcb6e, #e17055);
    border-color: #ff6b6b;
  }
}

.medal-icon {
  font-size: 40rpx;
}

.medal-img {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
}

.medal-progress {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.progress-text {
  display: block;
  font-size: 24rpx;
  color: $color-text-sub;
  margin-bottom: 16rpx;
}

.progress-bar {
  height: 12rpx;
  background: #eee;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #1abc9c, #16a085);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.menu-section {
  @include card;
  padding: 0;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item-hover {
  background: $color-bg;
}

.menu-item-danger .menu-text {
  color: $color-danger;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: $color-text;
}

.menu-arrow {
  color: $color-text-sub;
  font-size: 32rpx;
}

/* 昵称弹层 */
.nick-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
}

.nick-dialog {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.nick-dialog-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 24rpx;
  text-align: center;
}

.nick-input {
  @include form-control-base;
  height: 88rpx;
  padding: 0 24rpx;
  margin-bottom: 32rpx;
  background: $color-bg;
  border-radius: 12rpx;
  border: none;
}

.feedback-area {
  @include form-control-base;
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  margin-bottom: 32rpx;
  background: $color-bg;
  border-radius: 12rpx;
  border: none;
  resize: none;
}

.nick-actions {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.nick-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
  &::after {
    border: none;
  }
}

.nick-btn.cancel {
  background: #ecf0f1;
  color: $color-text;
}

.nick-btn.ok {
  background: $color-primary;
  color: #fff;
}
</style>
