import { http } from '@/utils/request';
import { uploadMemberAttachment, type UploadMemberOptions } from '@/utils/upload';

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
	/** POST /quit/user/profile — 修改展示昵称或头像 */
	userProfileSave(data: { nickname?: string; avatar?: string }) {
		return http.post('/api/quit/user/profile', data);
	},
	/** POST /api/ajax/upload — 会员端附件上传，返回相对路径供 userProfileSave.avatar */
	uploadMemberFile(filePath: string, options?: UploadMemberOptions) {
		return uploadMemberAttachment(filePath, options);
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
	/** GET /quit/common/groupIcons → data.icons 为完整 URL，见 module-home-user-common.md */
	groupIcons() {
		return http.get<{ icons?: string[] }>('/api/quit/common/groupIcons');
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
