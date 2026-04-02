# 小组模块 `QuitGroup`

均需登录。

## 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quit/group/index` | 小组列表（关键词搜索） |
| GET | `/quit/group/detail` | 小组详情与成员预览 |
| POST | `/quit/group/save` | 创建小组 |
| POST | `/quit/group/join` | 加入小组 |
| POST | `/quit/group/leave` | 退出小组（创建者不可退） |
| GET | `/quit/group/posts` | 小组动态列表 |
| POST | `/quit/group/postAdd` | 发布动态 |

---

## GET `/quit/group/index`

| 参数 | 说明 |
|------|------|
| page | 页码 |
| limit | 每页条数，最大 50 |
| keyword | 可选，名称/描述模糊搜索 |

返回 `data.list`, `data.total`。

---

## GET `/quit/group/detail`

| 参数 | 必填 |
|------|------|
| id | 小组 ID |

返回 `group`, `joined`（当前用户是否已加入）, `members`（最多 50 条）。

---

## POST `/quit/group/save`

| 参数 | 说明 |
|------|------|
| name | 必填 |
| description | 可选 |
| cover | 可选 |

成功返回 `data.id`。创建者自动成为管理员成员。

---

## POST `/quit/group/join` / `leave`

| 参数 | 说明 |
|------|------|
| group_id | 小组 ID |

---

## GET `/quit/group/posts`

| 参数 | 说明 |
|------|------|
| group_id | 小组 ID |
| page / limit | 分页 |

---

## POST `/quit/group/postAdd`

| 参数 | 说明 |
|------|------|
| group_id | 小组 ID |
| content | 文本，与图片二选一必填 |
| images | 数组，多图 URL（ThinkPHP 数组参数 `images/a`） |

仅已加入小组成员可发。

---

## 系统同步动态（无单独接口）

用户 **全局打卡** 时，服务端会向该用户 **已加入的每个小组** 自动写入一条 `quit_group_post`（与 `POST /quit/group/postAdd` 同表）：

- **无烟打卡**：内容前缀 `【无烟打卡】`，含连续天数鼓励文案。
- **复吸打卡**：内容前缀 `【复吸预警】`，提示小组关注与鼓励。

前端在 `GET /quit/group/posts` 列表中与其它动态一并展示即可（可按正文前缀区分样式）。
