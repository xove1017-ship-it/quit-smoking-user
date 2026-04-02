# 认证模块（微信登录）

完整 URL 示例：`POST /api/quit/wxlogin/login`（`api` 为应用名，见 [README](./README.md)）。

控制器：`app\api\controller\quit\Wxlogin`（继承 `Frontend`，非 `quit\Base`）。

## 说明

- 仅 `login` 方法**无需登录**。
- 需在 `config/quit_smoking.php`（或环境变量）中配置微信小程序 `app_id`、`app_secret`。
- 成功后会写入/关联 `user` 表（若存在 `wx_openid` 等字段），并返回会员信息与登录态（与全局会员 Token 机制一致）。

## 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/wxlogin/login` | `code`：微信小程序 `wx.login` 拿到的 `code`，换取 openid 并静默注册/登录 |

### POST `/quit/wxlogin/login`

**请求参数（表单或 JSON body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | `jscode2session` 用授权码 |

**成功 `data` 示例字段**

- `userInfo`：会员信息（与 `Auth::getUserInfo()` 一致，并可能含 `vip_level`）。
- `session.need_bind_phone`：是否需要绑定手机（当前实现为 `false`）。

**错误**

- 未配置微信参数：业务错误提示。
- 微信接口失败：返回微信 `errmsg` 相关信息。
