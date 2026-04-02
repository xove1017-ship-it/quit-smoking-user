import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import betApi from '@/api/bet'

/** player_limit === 1 为单人，否则多人（与后端约定一致） */
export function isSoloByPlayerLimit(b: Record<string, unknown> | null | undefined) {
	if (!b) return false
	if (b.player_limit != null) return Number(b.player_limit) === 1
	return String(b.type) === 'solo'
}

export function useBetDetail() {
	const betId = ref('')
	const loading = ref(true)
	const bet = ref<Record<string, unknown> | null>(null)
	const participants = ref<Record<string, unknown>[]>([])
	const compare = ref<Record<string, unknown>>({})
	const isIn = ref(false)
	const myRankHint = ref<string | null>(null)
	const timelineRows = ref<{ label: string; cells: boolean[] }[]>([])
	/** 多人时间线表头，与 timeline 每列对应 */
	const timelineColumnLabels = ref<string[]>([])
	const sym = ref<{ check: string; cross: string }>({ check: '✓', cross: '✗' })
	const todayLocked = ref(false)

	const isSolo = computed(() => isSoloByPlayerLimit(bet.value))

	const statusLine = computed(() => {
		const b = bet.value
		if (!b) return ''
		return String(b.status_text || b.status || '')
	})

	const remainLabel = computed(() => {
		const b = bet.value
		if (!b) return ''
		const t = String(b.remain_text || b.period_text || '').trim()
		if (t) return t
		const period = Number(b.period_days) || 0
		const c = compare.value as Record<string, unknown>
		const days = Number(c?.me ?? c?.self ?? Object.values(c || {})[0] ?? 0)
		if (period) {
			const r = Math.max(0, period - days)
			return `${period}天挑战 · 剩余${r}天`
		}
		return ''
	})

	const stakeLine = computed(() => {
		const b = bet.value
		if (!b) return ''
		if (b.stake_text) return String(b.stake_text)
		if (b.agreement_text) return String(b.agreement_text)
		return ''
	})

	const rankHintText = computed(() => {
		const m: Record<string, string> = {
			leading: '你暂时领先',
			behind: '你暂时落后',
			tied: '目前持平',
			none: '',
		}
		return m[String(myRankHint.value)] || ''
	})

	const participantLines = computed(() => {
		const cmp = compare.value || {}
		const parts = participants.value || []
		return parts.map((p, idx) => {
			const uid = p.user_id ?? p.id ?? idx
			const key = String(uid)
			const cmpMap = cmp as Record<string, unknown>
			const days = Number(cmpMap[key] ?? p.smoke_free_days ?? 0)
			return {
				key,
				name: String(p.nickname || p.name || `用户${idx + 1}`),
				av: String((p.nickname || p.name || '?').toString().slice(0, 1)),
				days,
			}
		})
	})

	const soloDays = computed(() => {
		const c = compare.value as Record<string, unknown>
		return Number(c?.me ?? c?.self ?? Object.values(c || {})[0] ?? 0)
	})

	const soloProgressText = computed(() => {
		const b = bet.value
		if (!b) return ''
		const days = soloDays.value
		const period = Number(b.period_days) || 0
		if (period) return `已坚持 ${days} / ${period} 天`
		return `已坚持 ${days} 天`
	})

	const successRateText = computed(() => {
		const b = bet.value
		const period = Number(b?.period_days) || 0
		if (!period) return '—'
		const pct = Math.round((soloDays.value / period) * 100)
		return `${Math.min(100, pct)}%`
	})

	const remainDaysText = computed(() => {
		const b = bet.value
		const period = Number(b?.period_days) || 0
		if (!period) return '—'
		const r = Math.max(0, period - soloDays.value)
		return String(r)
	})

	const canClaimReward = computed(() => {
		const b = bet.value
		if (!b || !isSolo.value) return false
		if ((b as { solo_reward_claimed?: boolean }).solo_reward_claimed) return false
		const period = Number(b.period_days) || 0
		return period > 0 && soloDays.value >= period
	})

	const duelBar = computed(() => {
		const lines = participantLines.value
		if (lines.length < 2) return { me: 50, them: 50, left: lines[0], right: lines[1] }
		const a = lines[0]?.days ?? 0
		const b = lines[1]?.days ?? 0
		const sum = a + b || 1
		return {
			me: Math.round((a / sum) * 100),
			them: Math.round((b / sum) * 100),
			left: lines[0],
			right: lines[1],
		}
	})

	function parseTimelinePayload(data: Record<string, unknown>) {
		const raw = data.timeline
		const userIds = (data.user_ids as unknown[]) || []
		const symbols = (data.symbols as { check?: string; cross?: string }) || {}
		sym.value = {
			check: symbols.check || '✓',
			cross: symbols.cross || '✗',
		}

		const rows: { label: string; cells: boolean[] }[] = []
		if (Array.isArray(raw)) {
			raw.forEach((r: Record<string, unknown>, i: number) => {
				const cells = (r.users || r.cols || r.cells || r.values || []) as unknown[]
				rows.push({
					label: String(r.day_label || r.label || r.date || `第${i + 1}天`),
					cells: cells.map((x) => !!x),
				})
			})
		} else if (raw && typeof raw === 'object') {
			Object.keys(raw as object).forEach((k) => {
				const row = (raw as Record<string, unknown>)[k]
				const cells = Array.isArray(row) ? row : Object.values(row || {})
				rows.push({
					label: k,
					cells: (cells as unknown[]).map((x) => !!x),
				})
			})
		}

		const n = userIds.length
		if (n > 0) {
			rows.forEach((r) => {
				while (r.cells.length < n) r.cells.push(false)
			})
		}
		timelineRows.value = rows
		const ids = userIds as unknown[]
		timelineColumnLabels.value = ids.map((id, idx) => {
			const p = participants.value.find((x) => String(x.user_id ?? x.id) === String(id))
			return p ? String(p.nickname || p.name || `用户${idx + 1}`) : `用户${idx + 1}`
		})
		if (timelineColumnLabels.value.length === 0 && participants.value.length > 0) {
			timelineColumnLabels.value = participants.value.map((p, i) =>
				String(p.nickname || p.name || `用户${i + 1}`),
			)
		}
	}

	function applyDetail(data: Record<string, unknown>) {
		const b = (data.bet as Record<string, unknown>) || null
		bet.value = b
		participants.value = (data.participants as Record<string, unknown>[]) || []
		compare.value = (data.compare as Record<string, unknown>) || {}
		isIn.value = !!data.is_in
		myRankHint.value = (data.my_rank_hint as string) || null
		if (b) {
			todayLocked.value = !!(b.today_checked_in ?? b.locked_today)
		}
	}

	function loadTimeline() {
		if (!betId.value) return
		betApi
			.timeline(betId.value)
			.then((res) => {
				const data = (res.data || {}) as Record<string, unknown>
				parseTimelinePayload(data)
				const b = data.bet as Record<string, unknown> | undefined
				if (b && !bet.value) bet.value = b
			})
			.catch(() => {
				timelineRows.value = []
				timelineColumnLabels.value = []
			})
	}

	function loadDetail() {
		if (!betId.value) return
		loading.value = true
		betApi
			.detail(betId.value)
			.then((res) => {
				const data = (res.data || {}) as Record<string, unknown>
				applyDetail(data)
			})
			.catch(() => {
				bet.value = null
			})
			.finally(() => {
				loading.value = false
				loadTimeline()
			})
	}

	function initRoute() {
		onLoad((q?: Record<string, string>) => {
			if (q?.id) betId.value = String(q.id)
		})
		onShow(() => {
			if (!betId.value) {
				loading.value = false
				return
			}
			loadDetail()
		})
	}

	async function confirmCheckin(smokeFree: boolean) {
		if (todayLocked.value) return
		const content = smokeFree
			? '确认今日无烟？确认后今日不可再改'
			: '记录吸烟将影响赌约结果，确定吗？'
		uni.showModal({
			title: smokeFree ? '无烟打卡' : '记录吸烟',
			content,
			success: async (r) => {
				if (!r.confirm) return
				try {
					await betApi.checkin(betId.value, smokeFree ? 1 : 0)
					if (!smokeFree) {
						uni.showToast({ title: '已记录', icon: 'success' })
					} else {
						uni.showToast({ title: '打卡成功', icon: 'success' })
						todayLocked.value = true
					}
					loadDetail()
				} catch (e: unknown) {
					const err = e as { code?: number; data?: { locked?: boolean }; msg?: string }
					if (err?.code === 409 && err?.data?.locked) {
						todayLocked.value = true
						uni.showToast({ title: err?.msg || '今日已打卡', icon: 'none' })
					}
				}
			},
		})
	}

	function confirmAbandon() {
		uni.showModal({
			title: '放弃赌约',
			content: '发起人放弃后赌约将取消，确定吗？',
			success: async (r) => {
				if (!r.confirm) return
				try {
					await betApi.abandon(betId.value)
					uni.showToast({ title: '已放弃', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 800)
				} catch {
					/* request toast */
				}
			},
		})
	}

	async function doClaimReward() {
		try {
			await betApi.claimReward(betId.value)
			uni.showToast({ title: '领取成功', icon: 'success' })
			loadDetail()
		} catch {
			/* */
		}
	}

	function goEdit() {
		uni.navigateTo({ url: `/pages/bet-edit/bet-edit?betId=${betId.value}` })
	}

	function goInviteOpponent() {
		uni.navigateTo({ url: `/pages/bet-opponent-agree/bet-opponent-agree?betId=${betId.value}` })
	}

	function goInviteWitness() {
		uni.navigateTo({ url: `/pages/bet-witness-agree/bet-witness-agree?betId=${betId.value}` })
	}

	async function remindOpponent() {
		const parts = participants.value
		const other = parts.find((p) => !p.is_me)
		const uid = other?.user_id ?? other?.id
		if (uid == null) {
			uni.showToast({ title: '暂无对手信息', icon: 'none' })
			return
		}
		try {
			await betApi.sendReminder(String(uid), betId.value)
			uni.showToast({ title: '已提醒', icon: 'none' })
		} catch {
			/* */
		}
	}

	function sharePoster() {
		uni.showToast({ title: '分享功能开发中', icon: 'none' })
	}

	return {
		betId,
		loading,
		bet,
		participants,
		compare,
		isIn,
		myRankHint,
		timelineRows,
		timelineColumnLabels,
		sym,
		todayLocked,
		isSolo,
		statusLine,
		remainLabel,
		stakeLine,
		rankHintText,
		participantLines,
		soloProgressText,
		successRateText,
		remainDaysText,
		canClaimReward,
		soloDays,
		duelBar,
		initRoute,
		loadDetail,
		loadTimeline,
		confirmCheckin,
		confirmAbandon,
		doClaimReward,
		goEdit,
		goInviteOpponent,
		goInviteWitness,
		remindOpponent,
		sharePoster,
	}
}
