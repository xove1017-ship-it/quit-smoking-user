import { http } from '@/utils/request'

const prefix = '/api/quit/group'

/** QuitGroup 模块，见 doc/api/module-group.md */
const groupApi = {
	index(params?: { page?: number; limit?: number; keyword?: string }) {
		return http.get<{ list?: Record<string, unknown>[]; total?: number }>(`${prefix}/index`, params)
	},
	detail(id: number | string) {
		return http.get(`${prefix}/detail`, { id })
	},
	save(data: { name: string; description?: string; cover?: string }) {
		return http.post<{ id?: number | string }>(`${prefix}/save`, data)
	},
	join(group_id: number | string) {
		return http.post(`${prefix}/join`, { group_id })
	},
	leave(group_id: number | string) {
		return http.post(`${prefix}/leave`, { group_id })
	},
	posts(params: { group_id: number | string; page?: number; limit?: number }) {
		return http.get<{ list?: unknown[] }>(`${prefix}/posts`, params)
	},
	postAdd(data: { group_id: number | string; content?: string; images?: string[] }) {
		return http.post(`${prefix}/postAdd`, data)
	},
}

export default groupApi
