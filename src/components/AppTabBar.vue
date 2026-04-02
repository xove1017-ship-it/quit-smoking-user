<template>
  <view class="tab-bar safe-bottom">
    <view
      v-for="(item, i) in tabs"
      :key="item.path"
      class="tab-item"
      :class="{ active: active === i }"
      @click="go(i)"
    >
      <image
        class="tab-icon"
        :class="{ 'tab-icon--on': active === i }"
        :src="active === i ? item.iconActive : item.icon"
        mode="aspectFit"
      />
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ active: number }>()

/* 与原型 index.html 底部导航顺序一致：首页 → 赌约 → 小组 → 记录 → 我的 */
const tabs = [
  {
    path: '/pages/index/index',
    text: '首页',
    icon: '/static/tabbar/home.png',
    iconActive: '/static/tabbar/home-active.png',
  },
  {
    path: '/pages/bet_index/bet_index',
    text: '赌约',
    icon: '/static/tabbar/bet.png',
    iconActive: '/static/tabbar/bet-active.png',
  },
  {
    path: '/pages/group/group',
    text: '小组',
    icon: '/static/tabbar/group.png',
    iconActive: '/static/tabbar/group-active.png',
  },
  {
    path: '/pages/record/record',
    text: '记录',
    icon: '/static/tabbar/record.png',
    iconActive: '/static/tabbar/record-active.png',
  },
  {
    path: '/pages/profile/profile',
    text: '我的',
    icon: '/static/tabbar/mine.png',
    iconActive: '/static/tabbar/mine-active.png',
  },
]

function go(i: number) {
  if (i === props.active) return
  uni.reLaunch({ url: tabs[i].path })
}
</script>

<style scoped lang="scss">
@import '../styles/theme.scss';

.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12rpx 0 8rpx;
  background: #fff;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  color: #bdc3c7;
  transition: color 0.2s ease;
}

.tab-item.active {
  color: $color-primary;
}

.tab-icon {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.tab-icon--on {
  transform: scale(1.06);
}

.tab-text {
  font-size: 20rpx;
}

.safe-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
