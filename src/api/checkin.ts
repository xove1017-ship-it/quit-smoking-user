import { http } from '@/utils/request'

const checkinPrefix = '/api/quit/checkin'
const recordPrefix = '/api/quit/record'

/** GET /quit/checkin/today，见 module-profile-checkin-record.md */
export interface CheckinTodayData {
	date?: string
	has_checkin?: boolean
	locked?: boolean
	is_smoke_free?: number | null
	note?: string | null
	streak_days?: number
	active_bets_today?: number
}

/** GET /quit/record/stats（节选），打卡页底部「今日统计」 */
export interface RecordStatsData {
	streak_days?: number
	success_rate_30_days?: number | string
	perfect_weeks?: number
	joined_group_count?: number
	joined_bet_count?: number
}

export interface CheckinSubmitResult {
	streak_days?: number
	locked?: boolean
	bet_checkins_synced?: number
}

const checkinApi = {
	today() {
		return http.get<CheckinTodayData>(`${checkinPrefix}/today`)
	},
	submit(data: { is_smoke_free: 0 | 1; note?: string }) {
		return http.post<CheckinSubmitResult>(`${checkinPrefix}/submit`, data)
	},
	calendar(params?: { start?: string; end?: string }) {
		return http.get<{ list: unknown[] }>(`${checkinPrefix}/calendar`, params)
	},
	recordStats() {
		return http.get<RecordStatsData>(`${recordPrefix}/stats`)
	},
}

export default checkinApi
