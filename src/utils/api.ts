import { http } from '@/utils/request';

const api = {
	wxLogin(code: string) {
		return http.post('/api/quit/wxlogin/login', { code });
	},
	/** 首页聚合：问候、 streak、阶段、赌约/小组预览等，见 module-home-user-common.md */
	homeIndex() {
		return http.get('/api/quit/home/index');
	},
	/** GET /quit/user/profile */
	userProfile() {
		return http.get('/api/quit/user/profile');
	},
	/** GET /quit/common/about */
	commonAbout() {
		return http.get('/api/quit/common/about');
	},
	sharePosterData() {
		return http.get('/api/quit/common/sharePosterData');
	},
	milestoneArticles() {
		return http.get('/api/quit/common/milestoneArticles');
	},
	medalLevels() {
		return http.get('/api/quit/common/medalLevels');
	},
	/** GET/POST /quit/profile/index */
	profileGet() {
		return http.get('/api/quit/profile/index');
	},
	profileSave(data: Record<string, unknown>) {
		return http.post('/api/quit/profile/index', data);
	},
	/** GET /quit/achievement/index */
	achievementIndex() {
		return http.get('/api/quit/achievement/index');
	},
	/** POST /quit/feedback/submit */
	feedbackSubmit(data: { content: string; contact?: string }) {
		return http.post('/api/quit/feedback/submit', data);
	},
};

export default api;
