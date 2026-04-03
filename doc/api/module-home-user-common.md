# 首页、我的、通用

除 `**/quit/common/about**`、`**/quit/common/help**` 外，均需登录（`quit\Base`）。

## 首页 `QuitHome`


| 方法  | 路径                 | 说明                                               |
| --- | ------------------ | ------------------------------------------------ |
| GET | `/quit/home/index` | 首页聚合：问候语、档案、连续无烟天数、累计无烟天、节省金额、今日打卡、身体阶段、赌约/小组预览等 |


**GET `/quit/home/index` 成功 `data` 主要字段（节选）**


| 字段                                                        | 说明                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| greeting                                                  | 早安/午安/晚上好                                                            |
| profile                                                   | 戒烟档案模型数据                                                             |
| streak_days                                               | 当前连续无烟天数                                                             |
| total_smoke_free_days                                     | 累计无烟天（打卡汇总）                                                          |
| stats_source                                              | `quit_timestamp` 或 `checkin_aggregate`，与 `GET /quit/record/stats` 一致 |
| quit_timestamp / quit_elapsed_seconds / quit_elapsed_days | 档案戒烟起始时间与经过时长（秒/天）；未设起始时间时部分为 `null`                                 |
| cigarettes_avoided                                        | 少抽支数（按蓝图与 `money_saved_yuan` 同源动态计算）                                 |
| life_minutes_recovered                                    | 生命挽回（分钟，按支数 × 11 估算）                                                 |
| money_saved_yuan                                          | 节省金额（元，按起始时间或打卡回退实时算，非静态存储）                                          |
| today_checked                                             | 今日是否已打卡                                                              |
| today_smoke_free                                          | 今日是否无烟（未打卡为 null）                                                    |
| today_status                                              | `NONE` / `SUCCESS` / `FAILED`，与打卡蓝图一致                                |
| health_stages / current_stage_index / next_stage          | 身体恢复阶段                                                               |
| bets / groups                                             | 预览列表                                                                 |


---

## 我的 `QuitUser`


| 方法   | 路径                   | 说明                                          |
| ---- | -------------------- | ------------------------------------------- |
| GET  | `/quit/user/profile` | 昵称、头像、会员等级（与 `user.vip_level` 一致）及展示文案      |
| POST | `/quit/user/profile` | 修改昵称和/或头像（body 至少包含 `nickname`、`avatar` 之一） |


**会员等级（与数据库、配置一致）**

- **库表字段**：`user.vip_level`（`varchar`，迁移注释见 `database/migrations/*user_vip_level*`），存**等级标识**英文小写，与下表 `level` 列一致。
- **配置**：`config/quit_member_levels.php`（阈值、中文名、条件文案、视觉参考说明）。
- **计算**：`app/common/library/QuitMemberLevel.php` — 根据 `**QuitSmokingHelper::maxHistoricalStreak()`（历史最长连续无烟打卡天数）** 取满足阈值的最高一档；**非**「当前连续 streak」单独作为唯一依据（复吸后当前 streak 会断，历史最高档仍保留）。打卡成功及个人资料拉取时会同步写回 `vip_level`。
- **接口字段**：`vip_level` 与 `level` 同为等级标识（兼容旧字段名）；`level_name` / `condition_text` / `image_hint` 为展示用；`badge_style` 为前端主题键（通常与 `level` 相同，无等级时为 `none`）。


| 等级名称  | 等级标识 `level`（`vip_level`） | 解锁条件（`condition_text`，与配置一致） | 视觉参考（`image_hint`，前端映射图标资源）              |
| ----- | ------------------------- | ---------------------------- | ---------------------------------------- |
| 青铜卫士  | `bronze`                  | 成功坚持无烟打卡 7 天                 | 铜质盾牌图标                                   |
| 白银先锋  | `silver`                  | 成功坚持无烟打卡 30 天                | 银质闪电图标                                   |
| 黄金战将  | `gold`                    | 成功坚持无烟打卡 90 天                | 金色奖杯图标                                   |
| 铂金领航  | `platinum`                | 成功坚持无烟打卡 180 天               | 铂金指南针图标                                  |
| 璀璨新生  | `rainbow`                 | 成功坚持无烟打卡 365 天               | 五彩虹光图标                                   |
| （未达档） | `none`                    | 历史最长连续无烟打卡未满 7 天时            | `level_name` 等为空串，仅用 `badge_style: none` |


**GET `/quit/user/profile` `data` 字段**


| 字段                | 说明                                                                               |
| ----------------- | -------------------------------------------------------------------------------- |
| user_id           | 当前用户 ID                                                                          |
| nickname / avatar | 昵称、头像                                                                            |
| vip_level         | 等级标识，与 `level` 相同：`none` / `bronze` / `silver` / `gold` / `platinum` / `rainbow` |
| level             | 同 `vip_level`，便于与产品文档「等级标识」对齐                                                    |
| level_name        | 等级中文名称，未达档（`none`）时为空字符串                                                         |
| condition_text    | 该档解锁条件说明文案（展示用）                                                                  |
| image_hint        | 视觉参考说明（非 URL；前端按 level 映射本地/静态图标）                                                |
| badge_style       | 主题/样式键：`none` 或 `bronze`～`rainbow`，与 `vip_level` 对应                              |


**POST `/quit/user/profile`**

- **用途**：小程序「我的」中修改展示昵称或头像；可与 GET 同路径，仅方法不同。
- **鉴权**：需登录（`ba-user-token`）。
- **请求体（JSON 或表单）**：至少包含以下字段之一：
  - `nickname`（string，可选）：新昵称，1～50 字符，规则与会员中心一致（汉字、字母、数字、下划线 `_`、破折号 `-`）；传入时不可为空字符串。
  - `avatar`（string，可选）：头像地址，一般为上传接口返回的相对路径或可访问 URL，长度不超过 500；可与 `nickname` 同时提交。仅传 `avatar` 且为空字符串时，表示按系统规则处理默认头像（与会员模型一致）。
- **成功**：`code === 1`，`msg` 为「资料更新成功~」等中文提示；`data` 结构与 GET 成功时一致（含更新后的 `nickname`、`avatar` 等）。
- **失败**：参数缺失/校验失败时 `code === 0`，`msg` 为中文说明（如未提供任何可修改项、昵称格式不合法等）。

### 头像图片上传（会员端公共接口，非 quit 路径）

修改头像时，先上传图片拿到存储路径，再将返回的 `**url`** 作为 `**POST /quit/user/profile**` 的 `avatar` 提交。


| 方法   | 路径                 | 说明                     |
| ---- | ------------------ | ---------------------- |
| POST | `/api/ajax/upload` | 会员端附件上传（BuildAdmin 通用） |


- **所属应用**：`api` 应用下 `Ajax` 控制器，**不在** `quit` 路由分组内；完整 URL 须带 `**/api`** 前缀，例如：`POST https://域名/api/ajax/upload`（本地联调可为 `.../index.php/api/ajax/upload`，依部署而定）。
- **鉴权**：需登录，请求头携带与其它会员接口相同的 `**ba-user-token`**（未登录按会员端约定返回，如 `code: 303`）。
- **请求**：`multipart/form-data`
  - `**file`**（必填）：表单文件字段名固定为 `file`。
  - `**driver**`（可选）：存储驱动，默认 `local`。
  - `**topic**`（可选）：存储子目录/业务主题，默认 `default`；需与后台上传策略一致时可按项目约定传值。
- **成功**：`code === 1`，`msg` 为中文「文件上传成功！」；`data.file` 为附件记录对象（已去掉部分内部字段），其中 `**url`** 为相对存储路径，用于写入资料接口的 `avatar`（会员模型会再处理默认头像与 CDN，与会员中心一致）。
- **失败**：`code === 0`，`msg` 为中文或可读说明（格式不允许、过大、未上传文件等）。
- **上传限制**：允许后缀、MIME、大小等以 `**GET /api/index/index`** 返回的 `site.upload`（或后台上传配置）为准；小程序端可先拉取该配置再校验本地选图。

---

## 通用 `QuitCommon`


| 方法  | 路径                               | 说明                                                                                                                                |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GET | `/quit/common/about`             | 关于我们：版本、邮箱、热线、网站、简介（`config/quit_smoking.php` 的 `about` 与 `**config/quit_smoking_site.json` 合并**，后者优先；后台 **戒烟管理 → 站点文案** 维护 JSON） |
| GET | `/quit/common/help`              | 帮助中心正文（`quit_smoking_site.json` 的 `help.content`；后台同上）                                                                            |
| GET | `/quit/common/sharePosterData`   | 分享海报用：连续天数、累计无烟天、30 天成功率、昵称                                                                                                       |
| GET | `/quit/common/milestoneArticles` | 戒烟里程碑文案列表（后台 `quit_milestone_config`，表不存在时返回空列表）                                                                                  |
| GET | `/quit/common/medalLevels`       | 勋章等级配置（后台 `quit_medal_level`，含 `image` 全路径）                                                                                       |
| GET | `/quit/common/groupIcons`        | 小组预设封面/图标 URL 列表（后台 **戒烟管理 → 小组图标**，`config/quit_group_icons.json`；`data.icons` 已 `full_url`）                                     |


**GET `/quit/common/about` `data`**

- `version`, `email`, `hotline`, `website_url`, `intro`（简介文案）
- 无需登录

**GET `/quit/common/help` `data`**

- `content`：帮助中心正文（纯文本或前端约定 HTML）
- 无需登录

**GET `/quit/common/sharePosterData` `data`**

- `streak_days`, `total_smoke_free_days`, `success_rate_30_days`, `nickname`

**GET `/quit/common/milestoneArticles`**

- `data.list`：配置行数组（字段以表结构为准，如标题、天数阈值、`status`、`weigh` 等）

**GET `/quit/common/medalLevels`**

- `data.list`：勋章等级配置；每项 `image` 已做 `full_url` 处理

**GET `/quit/common/groupIcons`**

- 无需登录。
- `data.icons`：`string[]`，每项为完整可访问的图片 URL，供创建/编辑小组时选择预设图标。

