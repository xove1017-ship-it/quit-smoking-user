<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import {
  isLoggedIn,
  notifyAuthBootstrapComplete,
  parseLoginPayload,
  setLoginSession,
} from "./utils/auth";
import api from "./utils/api";

/** 未登录也可访问（登录页、协议说明等） */
const PUBLIC_ROUTES = new Set(["pages/login/login", "pages/about/about"]);

/** 静默登录进行中，避免 onShow 抢先跳转登录页 */
let pendingSilentLogin = false;



function runSilentLogin() {
  pendingSilentLogin = true;
  uni.login({
    success: (loginRes) => {
      console.log('wxCode>>', loginRes);
      if (!loginRes.code) {
        pendingSilentLogin = false;
        notifyAuthBootstrapComplete();
        return;
      }
      api.wxLogin(loginRes.code).then((res) => {
        const d = (res.data || {}) as Record<string, unknown>;
        const { token, userInfo, session } = parseLoginPayload(d);
        if (token) {
          setLoginSession(token, {
            loginAt: Date.now(),
            userInfo: userInfo ?? d.userInfo,
            session,
          });
          notifyAuthBootstrapComplete();
          uni.reLaunch({ url: "/pages/index/index" });
        } else {
          notifyAuthBootstrapComplete();
        }
        pendingSilentLogin = false;
      }, () => {
        pendingSilentLogin = false;
        notifyAuthBootstrapComplete();
      });
    },
    fail: () => {
      pendingSilentLogin = false;
      notifyAuthBootstrapComplete();
    },
  });
}

onLaunch(() => {
  if (isLoggedIn()) {
    notifyAuthBootstrapComplete();
    uni.reLaunch({ url: "/pages/index/index" });
    return;
  }
  // #ifdef MP-WEIXIN
  runSilentLogin();
  // #endif
  // #ifndef MP-WEIXIN
  notifyAuthBootstrapComplete();
  // #endif
});

onShow(() => {
  if (pendingSilentLogin) return;
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as { route?: string } | undefined;
  const route = cur?.route;
  if (!route || isLoggedIn() || PUBLIC_ROUTES.has(route)) return;
  uni.reLaunch({ url: "/pages/login/login" });
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
@import "uview-plus/index.scss";

page {
  /* 业务蓝图视觉规范：与 theme.scss $color-primary 一致 */
  --primary-color: #1abc9c;
  background-color: #f8f9fa;
  color: #2c3e50;
}
</style>
