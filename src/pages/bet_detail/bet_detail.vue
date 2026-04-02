<template>
  <view class="wrap">
    <text class="hint">{{ msg }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import betApi from '@/api/bet'
import { isSoloByPlayerLimit } from '@/composables/useBetDetail'

const msg = ref('加载中…')

onLoad(async (q?: Record<string, string>) => {
  const id = q?.id
  if (!id) {
    msg.value = '缺少赌约参数'
    return
  }
  try {
    const res = await betApi.detail(id)
    const data = (res.data || {}) as Record<string, unknown>
    const b = data.bet as Record<string, unknown> | undefined
    const solo = isSoloByPlayerLimit(b || null)
    const page = solo ? 'bet_detail_solo/bet_detail_solo' : 'bet_detail_multi/bet_detail_multi'
    uni.redirectTo({ url: `/pages/${page}?id=${encodeURIComponent(id)}` })
  } catch {
    msg.value = '加载失败'
  }
})
</script>

<style scoped lang="scss">
@import '../../styles/theme.scss';

.wrap {
  min-height: 100vh;
  background: $color-bg;
  padding: 80rpx 32rpx;
}

.hint {
  font-size: 28rpx;
  color: $color-text-sub;
  text-align: center;
}
</style>
