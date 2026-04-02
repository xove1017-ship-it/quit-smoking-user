# 档案、打卡、记录

均需登录。

## 戒烟档案 `QuitProfile`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/profile/index` | 获取当前用户戒烟档案 |
| POST | `/quit/profile/index` | 保存档案 |

**GET** 返回 `data.profile`，其中 `price_per_pack_yuan` 为包价（元，由分转换）。

**POST 可选字段**

| 参数 | 说明 |
|------|------|
| quit_start_time | 戒烟开始时间戳（整数，可传 0 清空） |
| cigarettes_per_day | 每日支数 |
| cigarettes_per_pack | 每包支数（至少 1） |
| price_per_pack_yuan | 每包价格（元，服务端转为分存储） |

---

## 打卡 `QuitCheckin`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/checkin/today` | 今日是否已打卡、是否无烟、备注、连续天数 |
| POST | `/quit/checkin/submit` | 提交今日打卡（**确认后不可改**） |
| GET | `/quit/checkin/calendar` | 按日期范围查询打卡记录 |

**GET `/quit/checkin/today` `data`**

- `date`, `has_checkin`, `locked`, `is_smoke_free`, `note`, `streak_days`
- `active_bets_today`：当前自然日与您重叠、且处于 `pending`/`active` 的赌约数量（全局打卡成功后会向这些赌约各写入一条 `quit_bet_checkin`）

**POST `/quit/checkin/submit`**

| 参数 | 说明 |
|------|------|
| is_smoke_free | 1 无烟 / 0 复吸 |
| note | 备注，最长 500 字符 |

成功返回含 `streak_days`、`locked`、`bet_checkins_synced`（本次向赌约表新插入的条数；已存在的赌约日记录不会重复插入）。若今日已打卡，返回 `code: 409` 等业务码，且 `data.locked === true`。

**数据流**：`quit_checkin` 为唯一真相源（连续天数、成就、记录页统计）；提交后自动对「进行中且日期落在赌约期内」的参与赌约写入 `quit_bet_checkin`。从首页进入打卡页再提交，与小程序内路径一致。赌约详情内单独打卡 `POST /quit/bet/checkin`：若当日尚无全局打卡，则与上述提交等价；若已有全局打卡，则校验状态一致后仅补当前赌约记录。

**GET `/quit/checkin/calendar` 查询参数**

| 参数 | 默认 | 说明 |
|------|------|------|
| start | 当月1日 | 开始日期 `Y-m-d` |
| end | 今天 | 结束日期 `Y-m-d` |

返回 `data.list` 为打卡记录列表。

---

## 记录页统计 `QuitRecord`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/record/stats` | 最长 streak、30 天成功率、完美周、小组/赌约参与数、15 日趋势等 |

**GET `/quit/record/stats` `data` 主要字段（节选）**

- `profile`, `streak_days`, `max_historical_streak`, `total_smoke_free`, `total_checkin_days`, `relapse_days`
- `money_saved_yuan`, `success_rate`, `success_rate_30_days`, `perfect_weeks`
- `joined_group_count`, `joined_bet_count`, `trend_15days`（每日是否有打卡、是否无烟）

---

## 打卡页底部「今日统计」（原型 `checkin.html`）

产品标题仍为「今日统计」，**数据并非「仅今日产生」的增量**，而是当前登录用户的**汇总快照**，与记录页同源。

| 界面文案 | `data` 字段 | 说明 |
|----------|----------------|------|
| 连续无烟天数 | `streak_days` | 与 `GET /quit/checkin/today` 中 streak 含义一致 |
| 30天成功率 | `success_rate_30_days` | 最近 30 个自然日内无烟打卡天数 / 30 × 100% |
| 完美周数 | `perfect_weeks` | 完整自然周内 7 天均有无烟打卡的周数 |
| 参与小组 | `joined_group_count` | 已加入的小组数 |
| 参与赌约 | `joined_bet_count` | 参与记录数（`quit_bet_participant`） |

**联调**：打卡页进入时并行请求 `GET /quit/checkin/today`（控制区）与 `GET /quit/record/stats`（底部统计）；提交仅调用 `POST /quit/checkin/submit`，成功后返回首页并再次拉取上述接口即可刷新。
