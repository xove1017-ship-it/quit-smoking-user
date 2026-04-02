import { http } from '@/utils/request';

const api = {
	wxLogin(code: string) {
		return http.post('/api/quit/wxlogin/login', { code });
	},
	/** 首页聚合：问候、 streak、阶段、赌约/小组预览等，见 module-home-user-common.md */
	homeIndex() {
		return http.get('/api/quit/home/index');
	},
};

export default api;
