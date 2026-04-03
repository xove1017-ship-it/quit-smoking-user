import { http } from '@/utils/request'

const checkinPrefix = '/api/quit/checkin'
const recordPrefix = '/api/quit/record'


const checkinApi = {
	today() {
		return http.get<any>(`${checkinPrefix}/today`)
	},
	submit(data: { is_smoke_free: 0 | 1; note?: string }) {
		return http.post<any>(`${checkinPrefix}/submit`, data)
	},
	calendar(params?: { start?: string; end?: string }) {
		return http.get<{ list: unknown[] }>(`${checkinPrefix}/calendar`, params)
	},
	recordStats() {
		return http.get<any>(`${recordPrefix}/stats`)
	},
}

export default checkinApi
