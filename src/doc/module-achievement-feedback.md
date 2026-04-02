# 成就与反馈

均需登录。

## 成就 `QuitAchievement`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/achievement/index` | 里程碑、勋章列表、解锁状态、下一里程碑进度等 |

**GET `/quit/achievement/index` `data` 主要字段**

| 字段 | 说明 |
|------|------|
| milestones | 里程碑类成就（含 `unlocked`） |
| medals | 勋章类（含 `tier`：silver/gold/rainbow 等） |
| medal_count_by_tier | 各等级已解锁数量 |
| medal_unlocked_total | 已解锁勋章总数 |
| next_milestone | 下一个未达成里程碑 |
| next_milestone_progress_percent | 下一里程碑进度百分比 |
| achievements | milestones 与 medals 合并列表 |
| unlocked_ids | 已解锁成就 ID 数组 |

数据来源为 `quit_achievement` 与 `quit_user_achievement` 等表（以迁移为准）。

---

## 反馈 `QuitFeedback`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/quit/feedback/submit` | 提交用户反馈 |

**POST `/quit/feedback/submit`**

| 参数 | 说明 |
|------|------|
| content | 必填，反馈正文，最长 2000 字符 |
| contact | 可选，联系方式，最长 100 字符 |
