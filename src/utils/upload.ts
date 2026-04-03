/**
 * 会员端附件上传（BuildAdmin 通用）
 * POST /api/ajax/upload，multipart 字段名 `file`，见 doc/api/module-home-user-common.md
 */
import config from '@/config/env';
import { clearLoginSession, getToken, waitForAuthBootstrap } from '@/utils/auth';
import type { ApiResponse } from '@/utils/request';

const UPLOAD_PATH = '/api/ajax/upload';

function parseUploadJson(raw: string): ApiResponse {
  return JSON.parse(raw) as ApiResponse;
}

/** 从成功响应中取相对存储路径（写入资料接口 avatar 等） */
function extractStoredUrl(data: unknown): string {
  if (typeof data === 'string') {
    const t = data.trim();
    return t;
  }
  if (!data || typeof data !== 'object') return '';
  const d = data as Record<string, unknown>;
  const file = d.file;
  if (file && typeof file === 'object') {
    const url = (file as { url?: string }).url;
    if (typeof url === 'string' && url.trim()) return url.trim();
  }
  const direct =
    (typeof d.url === 'string' && d.url.trim()) ||
    (typeof (d as { fullurl?: string }).fullurl === 'string' &&
      (d as { fullurl?: string }).fullurl!.trim()) ||
    (typeof (d as { path?: string }).path === 'string' && (d as { path?: string }).path!.trim()) ||
    '';
  return direct;
}

export type UploadMemberOptions = {
  driver?: string;
  topic?: string;
};

/**
 * @param filePath 本地临时文件路径（如 chooseImage 返回）
 * @returns 后端返回的相对存储路径，用于 POST /quit/user/profile 的 `avatar` 等字段
 */
export function uploadMemberAttachment(
  filePath: string,
  options?: UploadMemberOptions,
): Promise<string> {
  return waitForAuthBootstrap().then(
    () =>
      new Promise((resolve, reject) => {
        const token = getToken() || '705eba44-51a0-4139-8a36-8c846a2f8234';
        const formData: Record<string, string> = {};
        if (options?.driver) formData.driver = options.driver;
        if (options?.topic) formData.topic = options.topic;

        uni.uploadFile({
          url: `${config.basePath}${UPLOAD_PATH}`,
          filePath,
          name: 'file',
          formData: Object.keys(formData).length ? formData : undefined,
          header: {
            server: '1',
            ...(token ? { 'ba-user-token': token } : {}),
          },
          success(res) {
            if (res.statusCode !== 200) {
              uni.showToast({ title: '上传失败', icon: 'none' });
              reject(new Error('http'));
              return;
            }
            try {
              const j = parseUploadJson(res.data as string);
              if (j.code !== 1) {
                if (j.code === 303) {
                  clearLoginSession();
                  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
                  setTimeout(() => {
                    uni.reLaunch({ url: '/pages/login/login' });
                  }, 1500);
                } else {
                  uni.showToast({ title: j.msg || '上传失败', icon: 'none' });
                }
                reject(j);
                return;
              }
              const url = extractStoredUrl(j.data);
              if (!url) {
                uni.showToast({ title: '未返回文件地址', icon: 'none' });
                reject(new Error('no url'));
                return;
              }
              resolve(url);
            } catch {
              uni.showToast({ title: '上传响应异常', icon: 'none' });
              reject(new Error('parse'));
            }
          },
          fail() {
            uni.showToast({ title: '网络异常', icon: 'none' });
            reject(new Error('network'));
          },
        });
      }),
  );
}
