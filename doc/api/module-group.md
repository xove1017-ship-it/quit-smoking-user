# 小组模块 `QuitGroup`

均需登录（请求头携带 `ba-user-token`，见全局 `request` 封装）。业务层成功码为 `code === 1`，业务数据在 `data` 内。

**接口前缀（与前端一致）**：`{basePath}/api/quit/group`  
文档中的路径均省略前缀，写作 `/quit/group/xxx`（实际请求 URL = 环境 `basePath` + `/api` + `/quit/group/xxx`）。

---

## 1. 模块定位与页面映射

对照《业务蓝图》第四层「互助小组」与当前小程序页面：

| 蓝图 / 原型 | 小程序页面 | 职责 |
|-------------|------------|------|
| `group-list.html` | `pages/group/group` | 我加入 / 推荐分两路：`GET /quit/group/index?type=joined` 与 `?type=recommended`；创建入口 |
| `group-detail.html` | `pages/group-detail/group-detail` | 小组信息、成员预览（按连续无烟天排序）、动态流 |
| `group-rank.html` | 可与详情合并或独立页 | 组内排行榜；当前实现中**成员排序与 streak 展示在详情页「小组成员」区块**完成 |
| `group-create.html` | `pages/group-create/group-create` | 创建表单（名称、描述、隐私等）；**联调时需调用** `POST /quit/group/save` |
| 发动态 | `pages/group-post-activity/group-post-activity` | 用户图文动态 → `postAdd` |

**核心业务联动（服务端建议实现）**

1. **动态自动广播**：用户在首页完成「无烟打卡」或「吸烟记录」（`POST /quit/checkin/submit`）后，应对该用户已加入的每个小组**自动生成一条小组动态**（系统发帖），使 `group-detail` 的「最新动态」与全局戒烟状态一致。客户端可不单独调发帖接口；若由服务端写入，动态项应带类型字段（见下文 `post_type`）以便 UI 区分「系统广播」与「用户发帖」。
2. **情绪支持**：成员对动态进行「加油 / 点赞 / 安慰」及累计次数，可作为成就模块「社交勋章」统计来源（见 `module-achievement-feedback.md`）；若当前仅有人工发帖，需后续增加互动接口或在下文「扩展」中落地。
3. **荣誉排序**：排行榜以成员的 **当前连续无烟天数**（与记录模块 `streak_days` / `currentStreak` 同源）降序排列；前三名在 UI 上可做「领跑者」等标识。列表数据可由 `GET /quit/group/detail` 的 `members` 提供（已排序），或拆独立 `rank` 接口（扩展）。

---

## 2. 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/group/index` | 小组列表（**必填** `type`：`joined` 我加入的 / `recommended` 推荐；可选搜索） |
| GET | `/quit/group/detail` | 小组详情、成员预览、是否已加入 |
| GET | `/quit/group/stats` | 小组打卡统计（某日汇总、成员当日状态、指定月日历；**仅小组成员**） |
| POST | `/quit/group/save` | 创建小组 |
| POST | `/quit/group/join` | 加入小组 |
| POST | `/quit/group/leave` | 退出小组（组长自动转让或仅一人时停用小组，见下文 6.2） |
| GET | `/quit/group/posts` | 小组动态分页 |
| POST | `/quit/group/postAdd` | 发布动态（用户 UGC；系统广播由打卡链路触发时可不同表同源查询） |

---

## 3. GET `/quit/group/index`

小组列表需**分两次请求**（或分页各查一遍）：`type=joined` 返回当前用户已加入的小组；`type=recommended` 返回**未加入**的可用小组（推荐大厅）。同一接口通过 `type` 区分，不再依赖单次返回里用 `joined` 字段人工拆分。

### 3.1 查询参数

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| **type** | **是** | string | `joined`：我加入的小组；`recommended`：推荐（排除已加入） |
| page | 否 | int | 页码，默认 `1` |
| limit | 否 | int | 每页条数，默认建议 `10`，**最大 50** |
| keyword | 否 | string | 按名称 / 描述模糊搜索 |

### 3.2 成功时 `data` 结构

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 小组摘要列表，见下表「列表项字段」 |
| total | int | 符合条件的总条数（分页用） |

**`list[]` 列表项字段（前端兼容多命名，服务端任选其一或并存）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int / string | 小组 ID |
| name | string | 小组名称（兼容 `title`） |
| description | string | 简介（兼容 `desc`） |
| cover | string | 封面图 URL，可无 |
| member_count | int | 成员人数（兼容 `members`、`memberCount`） |
| rate | float / null | **近 30 个自然日**（含当日）组内打卡记录的无烟占比：`无烟打卡条数 / (无烟+吸烟打卡条数) × 100`，保留一位小数；无打卡记录时为 `null`，前端可显示「—」 |
| today_checkin | int | **当日**组内已在全局打卡表完成打卡的**人数**（去重成员；兼容 `todayCheckin`） |
| new_message_count | int | **未读小组动态条数**：`quit_group_post.id` 大于当前用户在该组的 `last_read_post_id` 的条数。仅 **`type=joined`** 时有意义；`recommended` 下恒为 `0`。进入小组详情 `GET /quit/group/detail` 或拉取动态 `GET /quit/group/posts` 后，服务端会将已读位置更新为当前最大动态 ID |
| joined | bool | 与 `type` 一致：`joined` 请求下恒为 `true`，`recommended` 下恒为 `false`（便于列表组件复用） |
| visibility | string | `public` 公开小组，任意用户可直接加入；`private` 私密小组，加入需携带正确 **`invite_code`**（见 `POST /quit/group/join`） |
| requires_invite | bool | **可选**（与 `visibility` 等价表达）：`visibility === 'private'` 时为 `true`，便于前端按钮展示「填写邀请码加入」 |

**说明**：列表接口**不返回** `invite_code`，避免未加入用户枚举邀请码。

---

## 4. GET `/quit/group/detail`

小组详情页：返回小组元数据、当前用户是否已加入、成员列表（用于排序展示 streak）。

### 4.1 查询参数

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| id | **是** | int / string | 小组 ID |

### 4.2 成功时 `data` 结构

| 字段 | 类型 | 说明 |
|------|------|------|
| group | object | 小组信息，见下表 |
| joined | bool | 当前用户是否已加入该小组 |
| members | array | 成员预览列表，**最多 50 条**（按 `m.id` 升序）；含当日是否已打卡 |
| stats | object | 组级汇总：七日成功率、今日打卡人数、未读动态数，见下表 |

**`stats`（与列表页 `index` 口径对齐的补充）**

| 字段 | 类型 | 说明 |
|------|------|------|
| seven_day_success_rate | float / null | **近 7 个自然日**（含当日）组内打卡记录的无烟占比：`无烟条数 / (无烟+吸烟) × 100`；无记录为 `null` |
| today_checkin | int | **全组成员**（不限于 `members` 预览条数）当日已在 `quit_checkin` 打卡的**人数** |
| new_message_count | int | 未读小组动态条数（同 `index`：`post.id` &gt; `last_read_post_id`）。**未加入**小组时为 `0`。本接口在返回前会计算未读数，再将当前用户的已读位置更新为当前最大动态 ID（进入详情即视为已读） |

**`group` 对象**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int / string | 小组 ID |
| name | string | 名称 |
| description | string | 宣言/描述（兼容 `desc`） |
| cover | string | 封面 URL |
| member_count | int | 成员总数（兼容 `members`） |
| creator_user_id | int / string | 可选，创建者 ID，用于权限与退群规则 |
| visibility | string | `public` / `private` |
| invite_code | string / null | **仅当**当前用户为**组长（admin）**且小组为 `private` 时返回，供复制分享；非管理员或未登录不返回该字段 |
| requires_invite | bool | `visibility === 'private'` 时为 `true`，与列表口径一致 |

**`members[]` 单项**

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | int / string | 用户 ID（兼容 `uid`） |
| role | string | `admin` / `member` |
| createtime | int / string | 加入小组时间（表字段） |
| nickname | string | 昵称（兼容 `name`） |
| avatar | string | 头像 URL，可无 |
| has_checkin_today | bool | 当日是否已在全局打卡表打卡 |
| today_checkin_status | string | `success`：当日无烟打卡；`fail`：当日已打卡但标记吸烟；`pending`：当日尚未打卡 |
| checkin_time | string / null | 当日打卡提交时间 `H:i`，未打卡为 `null` |

可选扩展（荣誉榜等）：若需 `streak_days`、组内 `rank`，可由后续版本在详情或独立接口中补充；当前以当日打卡状态为主。

### 4.5 GET `/quit/group/stats`

小组「打卡详情」页专用：基于全局表 `quit_checkin` 与组员关系，统计**组内**某日打卡人数、无烟/复吸人数、指定自然月内每日打卡率等。**非本小组成员**调用返回业务失败（与 `You have no permission` 一致）。

#### 4.5.1 查询参数

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| **group_id** | **是** | int / string | 小组 ID |
| date | 否 | string | 统计日，格式 `Y-m-d`，默认当天；用于 `daily` 与 `members`（该日打卡状态） |
| month | 否 | string | 日历所在月，格式 `Y-m`，默认取 `date` 的年月；用于 `calendar` 与 `month_avg_checkin_rate` |

#### 4.5.2 成功时 `data` 结构

| 字段 | 类型 | 说明 |
|------|------|------|
| group | object | 与详情接口同结构的 `quit_group` 行 |
| date | string | 当前使用的统计日 `Y-m-d` |
| month | string | 当前使用的日历月 `Y-m` |
| member_total | int | 小组成员总数（与 `quit_group_member` 一致） |
| daily | object | 见下表 |
| members | array | 全部组员当日打卡明细（见下表） |
| calendar | array | 该月每一天的组内打卡聚合（长度 = 当月天数） |
| month_avg_checkin_rate | float / null | 当月「已过日期」的**日打卡率**算术平均（每日率 = 当日已打卡人数 / `member_total`）；当月尚无已过日期时为 `null` |

**`daily`**

| 字段 | 类型 | 说明 |
|------|------|------|
| checked_count | int | 当日已在 `quit_checkin` 打卡的组员人数 |
| success_count | int | 当日打卡且 `is_smoke_free = 1`（成功控烟） |
| fail_count | int | 当日打卡且 `is_smoke_free = 0`（记录为吸烟日） |
| pending_count | int | 当日尚未打卡的组员人数 |
| checkin_rate | float | `checked_count / member_total * 100`，保留一位小数 |
| success_rate | float / null | 在**当日已打卡**的人中，无烟占比：`success_count / (success_count + fail_count) * 100`；若当日无人打卡则为 `null` |

**`members[]`**

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | int | 用户 ID |
| role | string | `admin` / `member` |
| nickname | string | 昵称 |
| avatar | string | 头像 URL |
| checkin_status | string | `success`：当日无烟打卡；`fail`：当日已打卡但标记吸烟；`pending`：当日未打卡 |
| checkin_time | string / null | 打卡提交时间，`H:i`，未打卡为 `null` |

**`calendar[]`（单日一项）**

| 字段 | 类型 | 说明 |
|------|------|------|
| date | string | `Y-m-d` |
| day | int | 日号 1–31 |
| checked_count | int | 该日已打卡人数 |
| success_count / fail_count | int | 该日无烟 / 吸烟打卡人数 |
| member_total | int | 组员总数（与顶层一致） |
| checkin_rate | float | 该日打卡率（%） |
| is_today | bool | 是否为系统当前日 |
| is_future | bool | 是否晚于系统当前日（前端可灰显） |

---

## 5. POST `/quit/group/save`

创建小组；成功返回新小组 ID。创建者默认加入并成为管理员（具体以表结构为准）。

### 5.1 请求体（JSON）

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| name | **是** | string | 小组名称，建议限制长度如 2–20 字 |
| description | 否 | string | 目标宣言 / 描述 |
| cover | 否 | string | 封面图 URL（需先走上传拿到地址） |

**与创建页 UI 对齐的可选扩展（若库表支持，可一并传入；否则可忽略）**

| 参数 | 类型 | 说明 |
|------|------|------|
| visibility | string | `public` / `private`；选 **`private`** 时由服务端**生成**邀请码，创建者**无需**也不应自填邀请码 |
| max_members | int | 最大人数，如 20/50/100/200 |
| checkin_rule | string | `optional` / `daily` / `weekly` 等打卡要求 |

### 5.2 成功时 `data`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int / string | 新建小组 ID，前端创建成功后跳转详情需带此 ID |
| visibility | string | 与请求一致 |
| invite_code | string / null | 当 `visibility` 为 `private` 时返回 **8 位**邀请码（易读字符集），供创建者保存或分享；`public` 时为 `null` |

---

## 6. POST `/quit/group/join` / `POST /quit/group/leave`

### 6.1 请求体

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| group_id | **是** | int / string | 小组 ID |
| invite_code | 条件 | string | 当目标小组 `visibility` 为 **`private`** 时**必填**，须与组长持有的邀请码一致（大小写不敏感）；公开小组可不传 |

### 6.2 业务规则（说明用）

- **join**：`private` 小组未传或传错 `invite_code` 时返回业务失败（`code=0`），`msg` 为中文提示（如「私密小组需填写邀请码」「邀请码不正确」）。
- **leave**：普通成员直接退群并更新人数。组长（`admin`）退出时，若仍有其他成员，服务端将组长自动转让给**最早加入的一条**成员记录（并同步 `creator_id`）；若仅组长一人，则将小组 `status` 置为停用（`0`）后退出。失败时返回明确中文 `msg`。

### 6.3 成功时 `data`

可为空对象；前端主要依赖 `code === 1` 后刷新列表或详情。

---

## 7. GET `/quit/group/posts`

小组动态流：含用户发帖与（若已实现）打卡触发的系统广播。

### 7.1 查询参数

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| group_id | **是** | int / string | 小组 ID |
| page | 否 | int | 页码，默认 `1` |
| limit | 否 | int | 每页条数，默认 `10`，最大建议 `50` |

### 7.2 成功时 `data`

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 动态列表，按时间倒序 |
| total | int | 可选，总条数 |

**`list[]` 单项建议字段**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int / string | 动态 ID |
| user_id | int / string | 发布者用户 ID；系统广播可为 0 或官方账号（兼容 `uid`） |
| nickname | string | 展示名（兼容 `user_name`） |
| content | string | 正文（兼容 `text`） |
| images | string[] | 多图 URL，可无 |
| created_at | string | 创建时间（兼容 `time`、`date`，建议 ISO 或 `Y-m-d H:i:s`） |
| post_type | string | **建议**：`user` 用户发帖 / `checkin_success` 无烟打卡广播 / `checkin_relapse` 复吸预警 等，便于前端样式区分 |
| streak_days | int | 可选，广播类动态附带「已连续 N 天」 |
| reaction_count | int | 可选，互动总数（加油+点赞+安慰） |
| my_reaction | string | 可选，当前用户已选互动：`cheer` / `like` / `comfort` / 空 |

---

## 8. POST `/quit/group/postAdd`

小组成员发布图文动态（UGC）。**系统广播不建议由客户端伪造调用**，应由打卡成功链路在服务端写入同一张动态表或并行表，保证真实性。

### 8.1 请求体（JSON）

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| group_id | **是** | int / string | 小组 ID |
| content | 条件 | string | 文字内容；与 `images` 至少填一类 |
| images | 条件 | string[] | 图片 URL 数组；ThinkPHP 等传统写法可能是 `images/a` 形式传数组，与后端约定即可 |

### 8.2 权限与校验

- 仅已加入该小组的用户可发；否则返回业务错误码与文案。

### 8.3 成功时 `data`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int / string | 可选，新动态 ID |

---

## 9. 扩展接口（未在前端 `group.ts` 挂载时可暂不实现）

以下为蓝图中的能力，待产品与后端排期：

| 方法 | 建议路径 | 说明 |
|------|----------|------|
| POST | `/quit/group/postReaction` | 参数：`group_id`, `post_id`, `type`（`cheer`/`like`/`comfort`）；用于成就统计与列表展示 |
| GET | `/quit/group/rank` | 参数：`group_id`；仅返回排序榜单（若详情已足够则可省略） |

---

## 10. 前端引用

- 封装：`src/api/group.ts`
- 列表页：`pages/group/group.vue` → `index`
- 详情与动态：`pages/group-detail/group-detail.vue` → `detail` + `posts`
- 发动态：`pages/group-post-activity/group-post-activity.vue` → `postAdd`

文档版本随接口变更同步更新；字段以联调为准，可选字段前端均已做兼容读取。
