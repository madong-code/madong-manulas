# 后端 · 用户

---

## 1. 管理员（Admin）

- 表：`mic_system_admin`（或类似，前缀 `mic_`）。
- 由 `system` 模块 Service/Dao/Model 管理。
- 归属角色（`role_id` / 多对多角色关联）。
- 超管标识：`roles` 含 `superCodes=['*']` 的角色。

---

## 2. 会员（Member）

- 表：`mic_member_*`（前缀 `mic_`）。
- 由 `member` 模块管理（`app/service/admin/member`、`app/dao/member`、`app/model/member`）。
- 会员标签、等级等业务在 `member` 模块。

---

## 3. 用户上下文

登录后 `AccessTokenMiddleware` 注入当前用户 ID / 租户，Service 可通过上下文取当前操作用户（用于审计、数据权限）。

---

## 4. 约定

- 密码不返回前端（响应 DTO 排除）。
- 新增/编辑用户密码单独处理（加密、不回显）。
- 用户与角色关联变更后清除权限缓存。
