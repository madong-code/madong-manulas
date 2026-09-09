# 开发规范 · 安全

---

## 1. 认证与授权

- 所有后台接口经 `AccessTokenMiddleware` + `PermissionMiddleware`（见 [`backend/basic/middleware.md`](../backend/basic/middleware.md)）。
- 每个接口加 `#[Permission(code)]`，无权限码即任何人可访问（危险）。
- JWT 密钥仅存 `.env`；登出加入 Redis 黑名单。
- 超管 `superCodes=['*']` 谨慎分配。

---

## 2. 注入防护

- 一律用 ORM（ThinkORM）/参数绑定，禁止字符串拼接 SQL。
- 搜索条件经 `search()` 前缀解析，不直接拼接到 SQL。

---

## 3. 越权防护

- 写操作字段白名单：`inputFilter($all, $allow)`。
- 更新场景唯一校验 `Rule::unique` 自动 `ignore($id)`。
- 数据权限经 `AccessPermissionScope` 过滤（租户/部门）。

---

## 4. 上传安全

- 文件类型白名单、大小限制、重命名存储（见 [`backend/modules/upload.md`](../backend/modules/upload.md)）。
- 对象存储用签名 URL，避免公开写。

---

## 5. 输入校验

- 入参 Validate + `scene`；前端 `rules` 二次校验（防绕过）。
- 富文本/HTML 输出做 XSS 过滤。

---

## 6. 日志与审计

- 关键写操作经 `OperationMiddleware` + `OperationLogListener` 记录。
- 日志不打印密码/token。
- 异常全局捕获，生产不泄露堆栈。

---

## 7. 依赖安全

- 定期 `composer audit` / `pnpm audit`。
- 不引入未审核的第三方包；内核 `core/` 不擅自改。
