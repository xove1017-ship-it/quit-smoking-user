import { http } from '@/utils/request'

const prefix = '/api/quit/bet'

/** QuitBet 模块接口，见 module-bet.md */
const betApi = {
	index(params?: { status?: string; page?: number; limit?: number }) {
		return http.get<{ list: unknown[]; total?: number }>(`${prefix}/index`, params)
	},
	hall(params?: { page?: number; limit?: number }) {
		return http.get<{ list: unknown[]; total?: number }>(`${prefix}/hall`, params)
	},
	detail(id: number | string) {
		return http.get(`${prefix}/detail`, { id })
	},
	save(data: Record<string, unknown>) {
		return http.post<{ id?: number | string }>(`${prefix}/save`, data)
	},
	join(bet_id: number | string) {
		return http.post(`${prefix}/join`, { bet_id })
	},
	checkin(bet_id: number | string, is_smoke_free: 0 | 1) {
		return http.post(`${prefix}/checkin`, { bet_id, is_smoke_free })
	},
	timeline(bet_id: number | string) {
		return http.get(`${prefix}/timeline`, { bet_id })
	},
	abandon(bet_id: number | string) {
		return http.post(`${prefix}/abandon`, { bet_id })
	},
	modify(data: Record<string, unknown>) {
		return http.post(`${prefix}/modify`, data)
	},
	claimReward(bet_id: number | string) {
		return http.post(`${prefix}/claimReward`, { bet_id })
	},
	settle(data: {
		bet_id: number | string
		winner_user_id?: number | string
		settlement_summary?: string
	}) {
		return http.post(`${prefix}/settle`, data)
	},
	inviteWitness(bet_id: number | string, witness_user_id: number | string) {
		return http.post(`${prefix}/inviteWitness`, { bet_id, witness_user_id })
	},
	sendReminder(to_user_id: number | string, bet_id: number | string) {
		return http.post(`${prefix}/sendReminder`, { to_user_id, bet_id })
	},
}

export default betApi
