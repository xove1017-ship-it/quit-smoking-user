<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { isLoggedIn, setLoginSession } from "./utils/auth";
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
        return;
      }
      api.wxLogin(loginRes.code).then((res) => {
        const d = res.data;
        const token = d.userInfo.token;
        if (token) {
          setLoginSession(token, {
            loginAt: Date.now(),
            userInfo: d.userInfo,
            session: d.session,
          });
          uni.reLaunch({ url: "/pages/index/index" });
        }
        pendingSilentLogin = false;
      }, () => {
        pendingSilentLogin = false;
      });
    },
    fail: () => {
      pendingSilentLogin = false;
    },
  });
}

onLaunch(() => {
  if (isLoggedIn()) {
    uni.reLaunch({ url: "/pages/index/index" });
    return;
  }
  // #ifdef MP-WEIXIN
  runSilentLogin();
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
  background-color: #f8f9fa;
  color: #2c3e50;
}
</style>
