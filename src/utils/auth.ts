/** 本地登录态（后续可替换为服务端下发的 token） */
const KEY_TOKEN = "quit_smoking_token";
const KEY_USER = "quit_smoking_user";

/**
 * App 冷启动时（尤其微信小程序静默登录未完成前），业务请求若抢先发出会无 token。
 * 在 App 完成首次静默登录尝试（成功/失败）或确认已登录后调用 notifyAuthBootstrapComplete；
 * 需鉴权的请求在 request 内 await waitForAuthBootstrap。
 */
let authBootstrapResolved = false;
const authBootstrapWaiters: Array<() => void> = [];

export function notifyAuthBootstrapComplete(): void {
  if (authBootstrapResolved) return;
  authBootstrapResolved = true;
  authBootstrapWaiters.splice(0).forEach((fn) => fn());
}

/** 非登录类接口发请求前等待，避免首页等与静默登录竞态 */
export function waitForAuthBootstrap(): Promise<void> {
  if (authBootstrapResolved || isLoggedIn()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    authBootstrapWaiters.push(resolve);
  });
}

export function isLoggedIn(): boolean {
  return !!uni.getStorageSync(KEY_TOKEN);
}

export function getToken(): string {
  return uni.getStorageSync(KEY_TOKEN) || "";
}

export function setLoginSession(token: string, user?: Record<string, unknown>) {
  uni.setStorageSync(KEY_TOKEN, token);
  if (user !== undefined) {
    uni.setStorageSync(KEY_USER, user);
  }
}

export function clearLoginSession() {
  uni.removeStorageSync(KEY_TOKEN);
  uni.removeStorageSync(KEY_USER);
}

/** 解析 POST /quit/wxlogin/login 的 data，兼容 userInfo.token / token 等字段 */
export function parseLoginPayload(data: Record<string, unknown> | null | undefined): {
  token: string | null;
  userInfo: Record<string, unknown> | undefined;
  session: unknown;
} {
  if (!data || typeof data !== "object") {
    return { token: null, userInfo: undefined, session: undefined };
  }
  const userInfo = data.userInfo as Record<string, unknown> | undefined;
  const token =
    (typeof data.token === "string" && data.token) ||
    (userInfo && typeof userInfo.token === "string" && userInfo.token) ||
    (typeof (data as { user_token?: string }).user_token === "string" &&
      (data as { user_token?: string }).user_token) ||
    null;
  return { token, userInfo, session: data.session };
}
