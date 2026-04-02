/** 本地登录态（后续可替换为服务端下发的 token） */
const KEY_TOKEN = "quit_smoking_token";
const KEY_USER = "quit_smoking_user";

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
