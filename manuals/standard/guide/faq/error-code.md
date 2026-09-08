# 错误码对照

统一响应 `code` 字段含义（见 [`backend/basic/request-response.md`](../backend/basic/request-response.md)）：

| code | 含义 | 处理建议 |
| ---- | ---- | ---- |
| 200 | 成功 | 正常 |
| 400 | 业务错误（参数/数据不存在） | 提示 `message`，检查入参 |
| 401 | 未认证（token 失效/缺失） | 前端拦截器自动刷新 token；刷新失败跳登录 |
| 403 | 无权限 | 提示无权限，检查权限码 |
| 404 | 资源/路由不存在 | 检查接口路径、路由注册 |
| 405 | 方法不允许 | 检查 HTTP 方法 |
| 422 | 校验失败 | 提示字段错误 |
| 429 | 请求过于频繁 | 限流，稍后重试 |
| 500 | 系统错误 | 查后端日志，生产不暴露堆栈 |
| 503 | 服务不可用 | 检查依赖（DB/Redis） |

> 业务可定义更细的子码，通过 `message` 说明。前端 `Json::fail($msg, [], $code)` 可自定义 code。

---

## 前端侧联动

- 401：请求拦截器用 refresh token 重试（见 [`frontend/common/request.md`](../frontend/common/request.md)）。
- 403：按钮/菜单按 `useAccess` 隐藏（见 [`frontend/common/access.md`](../frontend/common/access.md)）。
- 其他：全局错误提示 `message`。
