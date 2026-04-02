// src/utils/request.ts
import config from '@/config/env'
import { getToken, clearLoginSession, waitForAuthBootstrap } from '@/utils/auth'

// 1. 基础配置
const BASE_URL = config.basePath;

// 定义通用响应结构
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  time?: number;
}

function isNoAuthUrl(url: string): boolean {
  return url.includes('/quit/wxlogin/login');
}

// 2. 核心请求函数
const request = <T = any>(options: UniApp.RequestOptions): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const fullUrl = options.url.startsWith('http') ? options.url : BASE_URL + options.url;
    const run = () => {
    const token = getToken() || '08b01656-b2fc-476f-b2ae-78ef2abee2ac';
    const headers: Record<string, string> = {
      server: '1',
      ...options.header as Record<string, string>,
    };
    if (!isNoAuthUrl(fullUrl) && token) {
      headers['ba-user-token'] = token;
    }

    uni.request({
      // 拼接完整 URL
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (response) => {
        // HTTP 状态码判断
        if (response.statusCode === 200) {
          const res = response.data as ApiResponse<T>;

          // 业务状态码判断 (根据 API 文档 code=1 为成功)
          if (res.code === 1) {
            resolve(res);
          } else {
            // 处理特定业务错误码
            // 仅会话失效类错误登出；业务 409（如赌约当日已打卡 locked）不登出
            if (res.code === 303) {
              clearLoginSession();
              uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
              // 延迟跳转，给用户看提示的时间
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/login/login' });
              }, 1500);
            } else if (res.code === 2 || res.code === 3 || res.code === 4 || res.code == 6) {
              // 下单出错 单独判断
            } else {
              // 其他业务错误
              uni.showToast({ title: res.msg || '请求失败', icon: 'none' });
            }
            reject(res);
          }
        } else {
          // HTTP 错误处理
          const errMsg = `请求失败 [${response.statusCode}]`;
          uni.showToast({ title: errMsg, icon: 'none' });
          console.error('HTTP Error:', response);
          reject(response);
        }
      },
      fail: (err) => {
        console.error('Network Error:', err);
        uni.showToast({ title: '网络连接异常', icon: 'none' });
        reject(err);
      }
    });
    };

    if (isNoAuthUrl(fullUrl)) {
      run();
    } else {
      waitForAuthBootstrap().then(run, reject);
    }
  });
};

// 3. 导出简化后的对象
export const http = {
  get: <T = any>(url: string, data?: any) => request<T>({ url, method: 'GET', data }),
  post: <T = any>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T = any>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  delete: <T = any>(url: string, data?: any) => request<T>({ url, method: 'DELETE', data }),
};
