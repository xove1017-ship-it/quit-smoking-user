import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import betApi from '@/api/bet'

const MS_PER_DAY = 86400000

/** player_limit === 1 为单人，否则多人（与后端约定一致） */
export function isSoloByPlayerLimit(b: Record<string, unknown> | null | undefined) {
	if (!b) return false
	if (b.player_limit != null) return Number(b.player_limit) === 1
	return String(b.type) === 'solo'
}

function getStoredUserId(): string | number | undefined {
	const u = uni.getStorageSync('quit_smoking_user') as Record<string, unknown> | undefined
	if (!u) return undefined
	const ui = u.userInfo as Record<string, unknown> | undefined
	const id = ui?.id ?? ui?.user_id ?? u.id ?? u.user_id
	return id as string | number | undefined
}

/**
 * 详情无 status_text 时，与 module-bet.md 列表规则对齐的兜底映射
 */
export function mapBetStatusToText(b: Record<string, unknown> | null | undefined): string {
	if (!b) return ''
	const st = String(b.status_text || '').trim()
	if (st) return st
	const raw = String(b.status || '').toLowerCase()
	const winner = b.winner_user_id
	const uid = getStoredUserId()
	if (raw === 'pending') return '待开始'
	if (raw === 'cancelled') return '已取消'
	if (raw === 'completed') {
		if (winner != null && uid != null && String(winner) === String(uid)) return '获胜'
		if (winner != null && uid != null && String(winner) !== String(uid)) return '失败'
		return '已结束'
	}
	if (raw === 'active') return '进行中'
	return String(b.status || '')
}

function resolveChallengeStartMs(b: Record<string, unknown> | null | undefined): number | null {
	if (!b) return null
	const s = b.start_time ?? b.start_at ?? b.begin_time
	if (s) {
		const t = new Date(String(s)).getTime()
		if (!Number.isNaN(t)) return t
	}
	const e = b.end_time ?? b.end_at
	const period = Number(b.period_days) || 0
	if (e && period > 0) {
		const endMs = new Date(String(e)).getTime()
		if (!Number.isNaN(endMs)) return endMs - (period - 1) * MS_PER_DAY
	}
	return null
}

function formatDateKey(d: Date): string {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

function isDateKeyLike(k: string): boolean {
	return /^\d{4}-\d{2}-\d{2}/.test(k.trim())
}

/** 从 compare 取当前用户无烟天（优先 smoke_free_days，与文档「每人对比」结构兼容） */
export function getMySmokeFreeDays(
	cmp: Record<string, unknown>,
	parts: Record<string, unknown>[],
): number {
	if (cmp.smoke_free_days != null && cmp.smoke_free_days !== '') {
		const n = Number(cmp.smoke_free_days)
		if (!Number.isNaN(n)) return n
	}
	if (cmp.me != null && cmp.me !== '') return Number(cmp.me) || 0
	if (cmp.self != null && cmp.self !== '') return Number(cmp.self) || 0
	const me = parts.find((p) => p.is_me)
	if (me) {
		const uid = me.user_id ?? me.id
		if (uid != null) {
			const v = cmp[String(uid)]
			if (v != null && v !== '') return Number(v) || 0
		}
		if (me.smoke_free_days != null) return Number(me.smoke_free_days) || 0
	}
	if (parts.length === 1) {
		const uid = parts[0].user_id ?? parts[0].id
		if (uid != null) {
			const v = cmp[String(uid)]
			if (v != null && v !== '') return Number(v) || 0
		}
	}
	const vals = Object.values(cmp).filter((v) => typeof v === 'number' || (typeof v === 'string' && v !== ''))
	if (vals.length === 1) return Number(vals[0]) || 0
	return 0
}

export type TimelineCell = boolean | null

export type TimelineRow = {
	/** 展示用：第几天（从挑战开始日起算） */
	dayIndex: number
	/** 副文案：日期或后端原样 */
	label: string
	cells: TimelineCell[]
	isToday?: boolean
	dateKey?: string
}

function remainDaysFromBet(b: Record<string, unknown>, smokeFreeDays: number): number {
	const end = b.end_time ?? b.end_at
	if (end) {
		const endMs = new Date(String(end)).getTime()
		if (!Number.isNaN(endMs)) {
			return Math.max(0, Math.ceil((endMs - Date.now()) / MS_PER_DAY))
		}
	}
	const period = Number(b.period_days) || 0
	return Math.max(0, period - smokeFreeDays)
}

/** 成功率：无烟天数 / max(1, 已进行天数)；已进行天数为挑战开始日至今日（含）的天数，且不超过 period_days */
function challengeElapsedDaysForRate(b: Record<string, unknown>): number {
	const period = Number(b.period_days) || 0
	const startMs = resolveChallengeStartMs(b)
	if (startMs == null) {
		return Math.max(1, period || 1)
	}
	const dayCount = Math.floor((Date.now() - startMs) / MS_PER_DAY) + 1
	if (period) return Math.max(1, Math.min(dayCount, period))
	return Math.max(1, dayCount)
}

function normalizeTimelineCell(v: unknown): TimelineCell {
	if (v === true || v === 1 || v === '1') return true
	if (v === false || v === 0 || v === '0') return false
	return null
}

function rowCellsFromRaw(row: unknown, userIds: unknown[]): TimelineCell[] {
	const n = userIds.length
	if (n > 0) {
		const o = row && typeof row === 'object' && !Array.isArray(row) ? (row as Record<string, unknown>) : null
		if (o) {
			const byId = userIds.map((uid) => normalizeTimelineCell(o[String(uid)]))
			if (byId.some((x) => x !== null)) return byId
		}
	}
	let arr: unknown[] = []
	if (Array.isArray(row)) {
		arr = row
	} else if (row && typeof row === 'object') {
		const oo = row as Record<string, unknown>
		const nested = (oo.users || oo.cols || oo.cells || oo.values) as unknown[]
		if (Array.isArray(nested)) arr = nested
		else arr = Object.values(row || {})
	} else if (row !== undefined && row !== null) {
		arr = [row]
	}
	const out: TimelineCell[] = []
	const len = n > 0 ? n : Math.max(arr.length, 1)
	for (let i = 0; i < len; i++) {
		out.push(arr[i] !== undefined ? normalizeTimelineCell(arr[i]) : null)
	}
	if (n > 0) {
		while (out.length < n) out.push(null)
		out.length = n
	}
	return out
}

export function useBetDetail() {
	const betId = ref('')
	const loading = ref(true)
	const bet = ref<Record<string, unknown> | null>(null)
	const participants = ref<Record<string, unknown>[]>([])
	const compare = ref<Record<string, unknown>>({})
	const isIn = ref(false)
	const myRankHint = ref<string | null>(null)
	const timelineRows = ref<TimelineRow[]>([])
	/** 多人时间线表头，与 timeline 每列对应 */
	const timelineColumnLabels = ref<string[]>([])
	const sym = ref<{ check: string; cross: string }>({ check: '✓', cross: '✗' })
	const todayLocked = ref(false)

	const isSolo = computed(() => isSoloByPlayerLimit(bet.value))

	const statusLine = computed(() => mapBetStatusToText(bet.value))

	const remainLabel = computed(() => {
		const b = bet.value
		if (!b) return ''
		const t = String(b.remain_text || b.period_text || '').trim()
		if (t) return t
		const period = Number(b.period_days) || 0
		if (!period) return ''
		const days = getMySmokeFreeDays(compare.value as Record<string, unknown>, participants.value)
		const r = remainDaysFromBet(b, days)
		return `${period}天挑战 · 剩余${r}天`
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

	const soloDays = computed(() =>
		getMySmokeFreeDays(compare.value as Record<string, unknown>, participants.value),
	)

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
		if (!b) return '—'
		const elapsed = challengeElapsedDaysForRate(b)
		const pct = Math.round((soloDays.value / elapsed) * 100)
		return `${Math.min(100, Math.max(0, pct))}%`
	})

	const remainDaysText = computed(() => {
		const b = bet.value
		if (!b) return '—'
		return String(remainDaysFromBet(b, soloDays.value))
	})

	const rewardSubtext = computed(() => {
		const b = bet.value
		if (!b) return '完成挑战后即可兑现约定'
		const pd = Number(b.period_days) || 0
		if (pd > 0) return `完成 ${pd} 天挑战后即可获得`
		return '完成挑战后即可兑现约定'
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

	function startOfDayMs(ms: number): number {
		const d = new Date(ms)
		d.setHours(0, 0, 0, 0)
		return d.getTime()
	}

	function parseLocalDateFromKey(key: string): Date | null {
		const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(key.trim())
		if (!m) return null
		const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0)
		return Number.isNaN(d.getTime()) ? null : d
	}

	function parseTimelinePayload(data: Record<string, unknown>) {
		const raw = data.timeline
		const userIds = (data.user_ids as unknown[]) || []
		const symbols = (data.symbols as { check?: string; cross?: string }) || {}
		sym.value = {
			check: symbols.check || '✓',
			cross: symbols.cross || '✗',
		}

		const b = ((data.bet as Record<string, unknown>) || bet.value || null) as Record<string, unknown> | null
		const rows: TimelineRow[] = []
		const todayKey = formatDateKey(new Date())

		if (Array.isArray(raw)) {
			raw.forEach((r: Record<string, unknown>, i: number) => {
				const cellsRaw = r.users ?? r.cols ?? r.cells ?? r.values ?? r
				const cells = rowCellsFromRaw(cellsRaw, userIds)
				const dayIndex = Number(r.day_index ?? r.day) || i + 1
				const dateKey = String(r.date || r.date_key || '').trim()
				const label = String(r.day_label || r.label || r.date || '').trim()
				rows.push({
					dayIndex,
					label: label || dateKey || `第${dayIndex}天`,
					cells,
					dateKey: dateKey || undefined,
					isToday: dateKey ? dateKey === todayKey : false,
				})
			})
		} else if (raw && typeof raw === 'object') {
			const map = raw as Record<string, unknown>
			const keysAll = Object.keys(map)
			const dateKeys = keysAll.filter(isDateKeyLike).sort()

			const fillFromRange = b && dateKeys.length > 0 && dateKeys.length === keysAll.length

			let startMs = b ? resolveChallengeStartMs(b) : null
			let endMs: number | null = null
			if (b) {
				const et = b.end_time ?? b.end_at
				if (et) {
					const t = new Date(String(et)).getTime()
					if (!Number.isNaN(t)) endMs = t
				}
			}
			if (endMs == null && dateKeys.length) {
				const last = parseLocalDateFromKey(dateKeys[dateKeys.length - 1])
				if (last) endMs = last.getTime()
			}
			const period = b ? Number(b.period_days) || 0 : 0
			if (endMs == null && startMs != null && period > 0) {
				endMs = startMs + (period - 1) * MS_PER_DAY
			}
			if (startMs == null && dateKeys.length) {
				const first = parseLocalDateFromKey(dateKeys[0])
				if (first) startMs = first.getTime()
			}

			if (fillFromRange && startMs != null && endMs != null) {
				const sm = startOfDayMs(startMs)
				const em = startOfDayMs(endMs)
				const keysRange: string[] = []
				let cur = sm
				while (cur <= em) {
					keysRange.push(formatDateKey(new Date(cur)))
					cur += MS_PER_DAY
				}
				for (const dk of keysRange) {
					const rowData = map[dk]
					const cells =
						rowData !== undefined
							? rowCellsFromRaw(rowData, userIds)
							: userIds.length > 0
								? userIds.map(() => null as TimelineCell)
								: [null]
					const dParse = parseLocalDateFromKey(dk)
					const dayIdx = dParse
						? Math.floor((startOfDayMs(dParse.getTime()) - sm) / MS_PER_DAY) + 1
						: 1
					rows.push({
						dayIndex: dayIdx,
						label: dk,
						cells,
						dateKey: dk,
						isToday: dk === todayKey,
					})
				}
			} else {
				const sorted = [...keysAll].sort()
				sorted.forEach((k, i) => {
					const row = map[k]
					const cells = rowCellsFromRaw(row, userIds)
					const dk = isDateKeyLike(k) ? k : ''
					rows.push({
						dayIndex: i + 1,
						label: k,
						cells,
						dateKey: dk || undefined,
						isToday: dk ? dk === todayKey : false,
					})
				})
			}
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
		rewardSubtext,
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
