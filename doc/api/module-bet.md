# 赌约模块 `QuitBet`

均需登录。

## 列表与大厅

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/bet/index` | 我的赌约（参与或创建）分页 |
| GET | `/quit/bet/hall` | 进行中、可公开的赌约大厅 |
| GET | `/quit/bet/detail` | 赌约详情（参与者、对比、领先/落后提示） |

**GET `/quit/bet/index` 查询参数**

| 参数 | 说明 |
|------|------|
| status | 可选，按状态筛选 |
| page | 页码，默认 1 |
| limit | 每页条数，默认 10，最大 50 |

返回 `data.list`, `data.total`。

**列表项扩展字段（`GET /quit/bet/index`）**

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 库表原始状态：`pending` / `active` / `completed` / `cancelled` |
| status_code | int | 数字含义见下表；-1 表示未知状态 |
| status_text | string | 前端角标文案，与原型 `bet-list.html` 一致 |
| card_variant | string | 卡片样式：`ongoing` 进行中强调 / `won` 胜 / `lost` 负 / `ended` 灰显结束或已取消 / `pending` 待开始 |

**status_code 与 status 对应关系**

| status_code | 含义 | status（字符串） |
|-------------|------|-------------------|
| 0 | 待开始（等人加入） | `pending` |
| 1 | 进行中 | `active` |
| 2 | 已结束（已结算） | `completed` |
| 3 | 已取消 | `cancelled` |

**status_text 规则（在 status_code 基础上细分展示）**

- `pending` → 「待开始」
- `cancelled` → 「已取消」
- `completed`：当前用户在 `quit_bet_participant.result` 为 `lose` →「失败」；否则有 `winner_user_id` 且等于当前用户 →「获胜」；非当前用户 →「失败」；无胜者 →「已结束」
- `active` 且当前用户 `result=lose`（如全局打卡复吸导致）→「挑战失败」，卡片 `card_variant=lost`
- `active` 且 `type=solo` →「进行中」
- `active` 且多人（`duel`/`team`）：按无烟天对比 →「我领先N天」「落后N天」「并列领先」或「进行中」（不足两人对战时）

**全局打卡复吸时**：参与者记为 `lose`；`solo` 赌约直接 `completed`；`duel` 且仅有一名对手时对手记为 `win` 并 `completed`；多人 `team` 仅记本人失败，赌约可仍为 `active`。

**GET `/quit/bet/hall`**

- `page`, `limit` 同上。
- 列表项含创建者信息、参与人数、剩余秒数、进度百分比、`is_mine` 等。

**GET `/quit/bet/detail`**

| 参数 | 必填 |
|------|------|
| id | 赌约 ID |

返回 `bet`, `participants`, `is_in`, `compare`（每人无烟天）, `leader_user_id`, `my_rank_hint`（leading/behind/tied/none）。

---

## 创建与加入

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/bet/save` | 创建赌约 |
| POST | `/quit/bet/join` | 加入待开始的赌约 |

**POST `/quit/bet/save` 主要字段**

| 参数 | 说明 |
|------|------|
| type | `solo` / `duel` / `team` |
| title | 标题 |
| stake_text / agreement_text | 赌注说明、约定 |
| stake_preset | 预设赌注标识 |
| period_days | 周期天数，常见 7/14/21/30/60/90 |
| witness_user_id | 见证人用户 ID（可选） |
| reminder_minute | 0–1439，若表有字段则写入 |
| is_public | 是否进大厅（表有 `is_public` 时有效） |

单人创建后状态为 `active`，多人初始为 `pending`。成功返回 `data.id`。

**POST `/quit/bet/join`**

| 参数 | 说明 |
|------|------|
| bet_id | 赌约 ID |

人满后状态变为 `active`。

---

## 赌约内打卡与时间线

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/bet/checkin` | 赌约内当日打卡（与全局打卡一致；见下文） |
| GET | `/quit/bet/timeline` | 时间线 ✓/✗ |

**POST `/quit/bet/checkin`**

| 参数 | 说明 |
|------|------|
| bet_id | 赌约 ID |
| is_smoke_free | 1/0 |

- 若**当日尚未**在 `quit_checkin` 全局打卡：与 `POST /quit/checkin/submit` 等价（写入全局记录、同步所有进行中赌约的 `quit_bet_checkin`、成就等），成功时 `data` 可含 `streak_days`、`bet_checkins_synced`。
- 若**当日已**全局打卡：`is_smoke_free` 必须与全局记录一致，否则报错；仅补当前 `bet_id` 的赌约打卡（若尚未写入）。
- 赌约内当日已打卡返回 `409`，`data.locked === true`。

**GET `/quit/bet/timeline`**

| 参数 | 说明 |
|------|------|
| bet_id | 赌约 ID |

返回 `bet`, `user_ids`, `timeline`（按日按用户是否无烟）, `symbols`（check/cross）。

---

## 放弃、修改、领奖、结算

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/bet/abandon` | 发起人放弃（取消） |
| POST | `/quit/bet/modify` | 发起人在无赌约内打卡前修改 |
| POST | `/quit/bet/claimReward` | 单人挑战提前领奖（需表字段 `solo_reward_claimed`） |
| POST | `/quit/bet/settle` | 结算（创建者或见证人） |

**POST `/quit/bet/abandon`**：`bet_id`

**POST `/quit/bet/modify`**：`bet_id`, 及 `title`, `stake_text`, `agreement_text`, `period_days` 等

**POST `/quit/bet/claimReward`**：`bet_id`（仅 solo 且本人，且无烟天达到周期）

**POST `/quit/bet/settle`**：`bet_id`, `winner_user_id`, `settlement_summary`（若表有字段）

---

## 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/bet/inviteWitness` | 邀请见证人 |
| POST | `/quit/bet/sendReminder` | 向对手发打卡提醒（需 `quit_message` 表） |

**inviteWitness**：`bet_id`, `witness_user_id`

**sendReminder**：`to_user_id`, `bet_id`
