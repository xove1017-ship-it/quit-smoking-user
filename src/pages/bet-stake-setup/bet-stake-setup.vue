<template>
  <view class="page">
    <view class="header">
      <text class="title">设置赌约赌注</text>
      <text class="sub">🎁 选择挑战成功后的奖励 / 约定</text>
    </view>

    <view class="body">
      <!-- 单人 -->
      <view v-if="isSolo" class="card-block">
        <view class="row-h">
          <text class="hi">🎯</text>
          <text class="ht">个人奖励</text>
        </view>
        <view class="reward-grid">
          <view
            v-for="r in rewards"
            :key="r.id"
            class="reward-card"
            :class="{ selected: rewardId === r.id }"
            @click="pickReward(r.id)"
          >
            <text class="ri">{{ r.icon }}</text>
            <text class="rn">{{ r.name }}</text>
            <text class="rd">{{ r.desc }}</text>
          </view>
        </view>
        <input
          v-if="rewardId === 'custom'"
          v-model="customReward"
          class="custom-in"
          placeholder="请输入您的自定义奖励..."
        />
      </view>

      <!-- 多人 -->
      <view v-else class="card-block">
        <view class="row-h">
          <text class="hi">🤝</text>
          <text class="ht">约定</text>
        </view>
        <input v-model="agreement" class="agreement-input" placeholder="例如：输的人请赢的人吃饭" />
        <view class="stake-options">
          <view
            v-for="o in agreements"
            :key="o.v"
            class="stake-option"
            :class="{ selected: agreement === o.v }"
            @click="agreement = o.v"
          >
            <text>{{ o.label }}</text>
          </view>
        </view>
      </view>

      <!-- 预览 -->
      <view class="card-block preview">
        <view class="row-h">
          <text class="hi">👀</text>
          <text class="ht">赌约预览</text>
        </view>
        <view class="preview-box">
          <view class="preview-item">
            <text class="pl">挑战类型：</text>
            <text class="pv">{{ previewType }}</text>
          </view>
          <view class="preview-item">
            <text class="pl">参与人数：</text>
            <text class="pv">{{ participants }}人</text>
          </view>
          <view class="preview-item">
            <text class="pl">挑战周期：</text>
            <text class="pv">{{ periodDays }}天</text>
          </view>
          <view class="preview-item">
            <text class="pl">开始时间：</text>
            <text class="pv">{{ startLabel }}</text>
          </view>
          <view class="preview-item">
            <text class="pl">{{ isSolo ? '奖励' : '口头约定' }}：</text>
            <text class="pv">{{ stakeSummary }}</text>
          </view>
        </view>
      </view>

      <view class="btns">
        <button class="prev-btn" @click="back">上一步</button>
        <button class="create-btn" :disabled="!canCreate" @click="create">创建赌约</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import betApi from '@/api/bet'

const wizard = ref<Record<string, unknown>>({})
const rewardId = ref('')
const customReward = ref('')
const agreement = ref('')

const rewards = [
  { id: 'game', icon: '🎮', name: '买新游戏', desc: '完成挑战后奖励自己' },
  { id: 'travel', icon: '✈️', name: '短途旅行', desc: '放松身心，享受生活' },
  { id: 'gadget', icon: '📱', name: '电子产品', desc: '用省下的钱购买' },
  { id: 'custom', icon: '💡', name: '自定义', desc: '自由设定奖励' },
]

const agreements = [
  { label: '请吃饭', v: '输的人请赢的人吃饭' },
  { label: '帮做事', v: '输的人帮赢的人做一件事' },
  { label: '公开承认', v: '输的人公开承认戒烟成功' },
  { label: '写心得', v: '输的人写戒烟心得分享' },
]

onMounted(() => {
  wizard.value = uni.getStorageSync('betWizard') || {}
})

const isSolo = computed(() => wizard.value.type === 'solo')
const participants = computed(() => Number(wizard.value.participants) || 1)
const periodDays = computed(() => Number(wizard.value.periodDays) || 0)
const startLabel = computed(() =>
  wizard.value.start === 'tomorrow' ? '明天开始' : '今天开始',
)

const previewType = computed(() => {
  const t = wizard.value.type
  if (t === 'solo') return '单人挑战'
  if (t === '2') return '2人对决'
  if (t === '3') return '3人小组'
  if (t === 'custom') return '自定义人数'
  return '-'
})

const stakeSummary = computed(() => {
  if (isSolo.value) {
    if (rewardId.value === 'custom') return customReward.value || '（自定义）'
    const r = rewards.find((x) => x.id === rewardId.value)
    return r?.name || '—'
  }
  return agreement.value || '—'
})

const canCreate = computed(() => {
  if (!periodDays.value) return false
  if (isSolo.value) {
    if (!rewardId.value) return false
    if (rewardId.value === 'custom') return !!customReward.value.trim()
    return true
  }
  return !!agreement.value.trim()
})

function pickReward(id: string) {
  rewardId.value = id
}

function back() {
  uni.navigateBack()
}

function wizardTypeToApi(t: string): 'solo' | 'duel' | 'team' {
  if (t === 'solo') return 'solo'
  if (t === '2') return 'duel'
  return 'team'
}

async function create() {
  const title = `${previewType.value} · ${periodDays.value}天`
  const payload: Record<string, unknown> = {
    type: wizardTypeToApi(String(wizard.value.type || 'solo')),
    title,
    period_days: periodDays.value,
    stake_text: stakeSummary.value,
    agreement_text: isSolo.value ? '' : agreement.value.trim(),
    stake_preset: isSolo.value ? rewardId.value : '',
    is_public: true,
    reminder_minute: 0,
  }
  uni.showLoading({ title: '创建中', mask: true })
  try {
    const res = await betApi.save(payload)
    uni.removeStorageSync('betWizard')
    const id = (res.data as { id?: number | string })?.id
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => {
      if (id != null) {
        const page = isSolo.value ? 'bet_detail_solo/bet_detail_solo' : 'bet_detail_multi/bet_detail_multi'
        uni.reLaunch({ url: `/pages/${page}?id=${id}` })
      } else {
        uni.reLaunch({ url: '/pages/bet_index/bet_index' })
      }
    }, 500)
  } finally {
    uni.hideLoading()
  }
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
  margin-bottom: 8rpx;
}

.sub {
  font-size: 28rpx;
  color: $color-text-sub;
}

.body {
  padding: 32rpx;
}

.card-block {
  @include card;
  padding: 28rpx;
  margin-bottom: 24rpx;
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

.reward-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.reward-card {
  background: $color-bg;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  border: 4rpx solid transparent;
}

.reward-card.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.06);
}

.ri {
  font-size: 36rpx;
  display: block;
  margin-bottom: 8rpx;
}

.rn {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.rd {
  font-size: 22rpx;
  color: $color-text-sub;
}

.custom-in {
  margin-top: 16rpx;
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 26rpx;
}

.agreement-input {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
}

.stake-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.stake-option {
  padding: 20rpx 12rpx;
  text-align: center;
  background: $color-bg;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 26rpx;
}

.stake-option.selected {
  border-color: $color-primary;
  background: rgba(26, 188, 156, 0.06);
}

.preview-box {
  background: $color-bg;
  border-radius: 16rpx;
  padding: 24rpx;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
  font-size: 26rpx;
}

.pl {
  color: $color-text-sub;
}

.pv {
  font-weight: 600;
  color: $color-text;
  max-width: 60%;
  text-align: right;
}

.btns {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
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

.create-btn {
  flex: 2;
  padding: 28rpx;
  border-radius: 50rpx;
  border: none;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.create-btn[disabled] {
  background: #bdc3c7;
}
</style>
