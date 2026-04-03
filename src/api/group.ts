import { http } from '@/utils/request'

const prefix = '/api/quit/group'

/** QuitGroup 模块，见 doc/api/module-group.md */
const groupApi = {
	index(params?: {
		page?: number
		limit?: number
		keyword?: string
		/** 我加入的 joined / 推荐 recommended */
		type?: 'joined' | 'recommended'
	}) {
		return http.get<{ list?: Record<string, unknown>[]; total?: number }>(`${prefix}/index`, params)
	},
	detail(id: number | string) {
		return http.get(`${prefix}/detail`, { id })
	},
	/** 小组打卡详情页：日统计、成员当日状态、月历 */
	stats(params: { group_id: number | string; date?: string; month?: string }) {
		return http.get(`${prefix}/stats`, params)
	},
	save(data: {
		name: string
		description?: string
		cover?: string
		visibility?: string
		max_members?: number
		checkin_rule?: string
	}) {
		return http.post<{ id?: number | string; visibility?: string; invite_code?: string | null }>(
			`${prefix}/save`,
			data,
		)
	},
	/** 公开小组不传 `invite_code`；`visibility === 'private'` 时必填且须与组长邀请码一致（大小写不敏感） */
	join(group_id: number | string, invite_code?: string) {
		const body: { group_id: number | string; invite_code?: string } = { group_id }
		if (invite_code != null && String(invite_code).trim() !== '') {
			body.invite_code = String(invite_code).trim()
		}
		return http.post(`${prefix}/join`, body)
	},
	leave(group_id: number | string) {
		return http.post(`${prefix}/leave`, { group_id })
	},
	posts(params: { group_id: number | string; page?: number; limit?: number }) {
		return http.get<{ list?: unknown[]; total?: number }>(`${prefix}/posts`, params)
	},
	postAdd(data: { group_id: number | string; content?: string; images?: string[] }) {
		return http.post<{ id?: number | string }>(`${prefix}/postAdd`, data)
	},
}

export default groupApi
