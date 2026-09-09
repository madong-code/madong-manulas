# 后端 · 中间件

中间件负责横切关注点：鉴权、权限、操作日志。

---

## 1. 内置中间件（adminapi）

位于 `app/adminapi/middleware/`：

| 中间件 | 职责 |
| ---- | ---- |
| `AccessTokenMiddleware` | 解析 JWT，注入当前用户上下文 |
| `PermissionMiddleware` | 校验 `#[Permission(code)]` 权限码（Casbin） |
| `OperationMiddleware` | 记录操作日志（可选） |

---

## 2. 声明方式

控制器/方法上用 `#[Middleware(...)]`：

```php
#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class, OperationMiddleware::class)]
final class RoleController extends Crud { }
```

执行顺序：全局（`config/middleware.php`）→ 类级 → 方法级。

---

## 3. AccessTokenMiddleware

- 从 `Authorization: Bearer <token>` 取 JWT。
- 校验签名与有效期，解析出用户 ID / 租户，存入请求上下文。
- 无效则中断返回 401（前端请求拦截器自动刷新 token，见 [`frontend/common/request.md`](../frontend/common/request.md)）。

---

## 4. PermissionMiddleware

- 读取 Controller 方法上的 `#[Permission(code: [...])]`。
- 查询当前用户（Casbin）是否拥有该权限码。
- `superCodes = ['*']` 的用户（超管）放行全部（前端 `useAccess` 同理，见 [`frontend/common/access.md`](../frontend/common/access.md)）。
- 无权限返回 403。

---

## 5. 自定义中间件

新建类实现 `process($request, $handler)`，在 `config/middleware.php` 注册或类上注解：

```php
class XxxMiddleware implements MiddlewareInterface
{
    public function process(Request $request, callable $handler): Response
    {
        // 前置逻辑
        $response = $handler($request);
        // 后置逻辑
        return $response;
    }
}
```
