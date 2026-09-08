# 后端 · 认证（Auth）

---

## 1. 登录流程

```text
前端提交账号/密码 → adminapi 登录接口
  → Service 校验凭证（查 member/admin 用户表）
  → 生成 JWT（access + refresh）
  → 返回 token 给前端
前端存储 token，后续请求带 Authorization 头
```

- JWT 实现在 `core/security/jwt`，存储后端为 Redis（`RedisTokenStorage`）。
- 刷新：前端拦截器检测到 401 自动用 refresh token 调刷新接口（见 [`frontend/common/request.md`](../frontend/common/request.md)）。

---

## 2. Token 解析

`AccessTokenMiddleware` 解析 JWT，注入用户上下文（ID、租户、角色）。后续 Controller/Service 可从上下文取当前用户。

---

## 3. 登出

- 将当前 token 加入 Redis 黑名单（`RedisBlacklistStorage`）。
- 前端清除本地 token。

---

## 4. 安全

- 密码使用强哈希（bcrypt / 框架默认）。
- JWT 密钥仅存 `.env`，不入库。
- 超管权限码 `*` 放行（见 [rbac.md](./rbac.md)）。
- 登录失败次数限制建议走 Redis 限流。
