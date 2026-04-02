# 首页、我的、通用

均需登录（`quit\Base`）。

## 首页 `QuitHome`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/home/index` | 首页聚合：问候语、档案、连续无烟天数、累计无烟天、节省金额、今日打卡、身体阶段、赌约/小组预览等 |

**GET `/quit/home/index` 成功 `data` 主要字段（节选）**

| 字段 | 说明 |
|------|------|
| greeting | 早安/午安/晚上好 |
| profile | 戒烟档案模型数据 |
| streak_days | 当前连续无烟天数 |
| total_smoke_free_days | 累计无烟天（打卡汇总） |
| stats_source | `quit_timestamp` 或 `checkin_aggregate`，与 `GET /quit/record/stats` 一致 |
| quit_timestamp / quit_elapsed_seconds / quit_elapsed_days | 档案戒烟起始时间与经过时长（秒/天）；未设起始时间时部分为 `null` |
| cigarettes_avoided | 少抽支数（按蓝图与 `money_saved_yuan` 同源动态计算） |
| life_minutes_recovered | 生命挽回（分钟，按支数 × 11 估算） |
| money_saved_yuan | 节省金额（元，按起始时间或打卡回退实时算，非静态存储） |
| today_checked | 今日是否已打卡 |
| today_smoke_free | 今日是否无烟（未打卡为 null） |
| today_status | `NONE` / `SUCCESS` / `FAILED`，与打卡蓝图一致 |
| health_stages / current_stage_index / next_stage | 身体恢复阶段 |
| bets / groups | 预览列表 |

---

## 我的 `QuitUser`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/user/profile` | 昵称、头像、VIP 等级、徽章样式 |

**GET `/quit/user/profile` `data` 字段**

| 字段 | 说明 |
|------|------|
| user_id | 当前用户 ID |
| nickname / avatar | 昵称、头像 |
| vip_level | 如 none / silver / gold / rainbow（无字段时可能为 none） |
| badge_style | 与 VIP 对应的展示样式 |

---

## 通用 `QuitCommon`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/common/about` | 关于我们：版本、邮箱、热线、网站（来自 `config/quit_smoking.php` 的 `about`） |
| GET | `/quit/common/sharePosterData` | 分享海报用：连续天数、累计无烟天、30 天成功率、昵称 |
| GET | `/quit/common/milestoneArticles` | 戒烟里程碑文案列表（后台 `quit_milestone_config`，表不存在时返回空列表） |
| GET | `/quit/common/medalLevels` | 勋章等级配置（后台 `quit_medal_level`，含 `image` 全路径） |

**GET `/quit/common/about` `data`**

- `version`, `email`, `hotline`, `website_url`

**GET `/quit/common/sharePosterData` `data`**

- `streak_days`, `total_smoke_free_days`, `success_rate_30_days`, `nickname`

**GET `/quit/common/milestoneArticles`**

- `data.list`：配置行数组（字段以表结构为准，如标题、天数阈值、`status`、`weigh` 等）

**GET `/quit/common/medalLevels`**

- `data.list`：勋章等级配置；每项 `image` 已做 `full_url` 处理
