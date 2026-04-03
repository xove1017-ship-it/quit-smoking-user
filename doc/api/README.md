# 戒烟小程序 API 文档索引

本文档描述 `app/api/controller/quit/` 下会员端接口（ThinkPHP 8，多应用下 **`api` 应用**）。

## 分模块文档

| 模块 | 文件 |
|------|------|
| 认证（微信登录） | [module-auth.md](./module-auth.md) |
| 首页、我的、通用 | [module-home-user-common.md](./module-home-user-common.md) |
| 档案、打卡、记录 | [module-profile-checkin-record.md](./module-profile-checkin-record.md) |
| 赌约 | [module-bet.md](./module-bet.md) |
| 小组 | [module-group.md](./module-group.md) |
| 成就、反馈 | [module-achievement-feedback.md](./module-achievement-feedback.md) |

## 基础地址与路径

- **推荐（显式应用名）**：`http(s)://域名/api/quit/控制器/方法`  
  示例：`GET http://127.0.0.1:8000/api/quit/home/index`
- **带入口文件**：`http://域名/public/index.php/api/quit/home/index`
- 项目配置了 `app/api/route/app.php` 中 **`quit` 分组路由**，三段路径如 **`/api/quit/checkin/today`** 会正确落到子目录控制器。

联调请**统一使用带应用前缀的 URL**（`/api/quit/...`），勿依赖省略 `api` 的写法，以免多应用解析与本地环境不一致。

## 鉴权

- 除 [module-auth.md](./module-auth.md) 中的 **`POST /quit/wxlogin/login`** 外，其余接口**均需登录**。
- Token 通过 HTTP 头传递，与会员端一致，例如：**`ba-user-token`**（亦兼容项目内其它 `get_auth_token` 支持的写法）。
- 未登录时通常返回 **`code: 303`**，`data.type` 为 `need login`。

## 权限

- `quit` 模块控制器继承 `app\api\controller\quit\Base`，`$noNeedPermission = ['*']`，**登录即可调用**，不校验会员中心路由节点。

## 响应结构

```json
{
  "code": 1,
  "msg": "",
  "time": 1234567890,
  "data": {}
}
```

- `code === 1`：成功。
- `code === 0`：业务失败（见 `msg`）。
- 其它：如 `303` 未登录、`409` 冲突（如已打卡不可改）等。

## 接口一览（`quit` 业务）

路径均省略前缀 **`/api`**，实际请求为 **`/api` + 下表路径**。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/wxlogin/login` | 微信 code 登录（无需登录） |
| GET | `/quit/home/index` | 首页聚合 |
| GET | `/quit/user/profile` | 我的信息 |
| GET | `/quit/common/about` | 关于我们（`quit_smoking_site.json` 可覆盖，后台 **站点文案**） |
| GET | `/quit/common/help` | 帮助中心正文（同上） |
| GET | `/quit/common/sharePosterData` | 分享海报数据 |
| GET | `/quit/common/milestoneArticles` | 里程碑文案配置 |
| GET | `/quit/common/medalLevels` | 勋章等级配置 |
| GET | `/quit/common/groupIcons` | 小组预设图标 URL 列表 |
| GET/POST | `/quit/profile/index` | 戒烟档案读/写 |
| GET | `/quit/checkin/today` | 今日打卡状态 |
| POST | `/quit/checkin/submit` | 提交今日打卡 |
| GET | `/quit/checkin/calendar` | 日历打卡记录 |
| GET | `/quit/record/stats` | 记录页统计（打卡页底部统计同此接口） |
| GET | `/quit/achievement/index` | 成就与勋章 |
| POST | `/quit/feedback/submit` | 提交反馈 |
| GET | `/quit/bet/index` | 我的赌约 |
| GET | `/quit/bet/hall` | 赌约大厅 |
| GET | `/quit/bet/detail` | 赌约详情 |
| POST | `/quit/bet/save` | 创建赌约 |
| POST | `/quit/bet/join` | 加入赌约 |
| POST | `/quit/bet/checkin` | 赌约内打卡（与全局打卡联动，见档案/打卡文档） |
| GET | `/quit/bet/timeline` | 赌约时间线 |
| POST | `/quit/bet/abandon` | 放弃/取消 |
| POST | `/quit/bet/modify` | 修改赌约 |
| POST | `/quit/bet/claimReward` | 领奖 |
| POST | `/quit/bet/settle` | 结算 |
| POST | `/quit/bet/inviteWitness` | 邀请见证 |
| POST | `/quit/bet/sendReminder` | 提醒 |
| GET | `/quit/group/index` | 小组列表（`type=joined` / `type=recommended`） |
| GET | `/quit/group/detail` | 小组详情 |
| GET | `/quit/group/stats` | 小组打卡统计（成员可见） |
| POST | `/quit/group/save` | 创建小组 |
| POST | `/quit/group/join` | 加入小组 |
| POST | `/quit/group/leave` | 退出小组 |
| GET | `/quit/group/posts` | 小组动态 |
| POST | `/quit/group/postAdd` | 发动态 |

## 推荐联调顺序

1. `POST /quit/wxlogin/login`（或会员登录取得 token）。
2. `GET /quit/home/index`、`GET /quit/checkin/today`、`GET /quit/record/stats`（打卡页与首页）。
3. `GET /quit/profile/index`，按需 `POST /quit/profile/index`。
4. 未打卡：`POST /quit/checkin/submit`；已打卡应返回冲突码。
5. `GET /quit/achievement/index`；按需测赌约、小组、反馈。

## 测试命令

```bash
php -l app/api/controller/quit/*.php
php scripts/db_ping.php
set QUIT_API_BASE=http://127.0.0.1:8000/api
set BA_USER_TOKEN=
php scripts/quit_api_http_test.php
```

未配置 `BA_USER_TOKEN` 时，受保护接口应返回 `code: 303`。数据库未就绪时脚本可能跳过 HTTP 断言。
