# 权限管理

后端采用 **JWT 鉴权 + 注解式权限码 + Casbin RBAC** 的权限体系，由中间件链自动执行。

## 中间件链

每个后台控制器类上声明三个中间件：

```php
#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class, OperationMiddleware::class)]
```

| 中间件 | 职责 |
| --- | --- |
| `AccessTokenMiddleware` | 解析 JWT，注入当前用户上下文 |
| `PermissionMiddleware` | 方法级权限校验（见下） |
| `OperationMiddleware` | 记录操作日志 |

## 权限校验流程（PermissionMiddleware）

1. 解析请求指向的 `$controllerClass` / `$action`。
2. 检查 `#[AllowAnonymous]` 注解：**匿名可访问且无需权限**时直接放行（如登录接口）。
3. 解析 JWT 取 `userId`；为空抛 `401 UnauthorizedHttpException`。
4. `CurrentUser` 验证：若为**超级管理员**直接放行，跳过后续判断。
5. 解析类/方法上的 `#[Permission(code: ...)]` 注解，调用 `CurrentUser` 校验用户是否拥有该权限码。
6. 无权限抛 `403`（SSE 请求走 `SseHelper` 返回错误流）。

## 声明接口权限

```php
use madong\swagger\attribute\Permission;

#[OA\Post(path: '/system/post', summary: '新增', tags: ['岗位管理'])]
#[Permission(code: 'org:post:save')]
public function store(Request $request): \support\Response
{
    return parent::store($request);
}
```

- 权限码约定：`模块:资源:动作`，如 `org:post:list`、`org:post:save`、`org:post:update`、`org:post:delete`、`org:post:export`。
- 支持类级 `#[Permission(...)]` 作为方法默认值；方法级可覆盖。

## 匿名接口

```php
use madong\swagger\attribute\AllowAnonymous;

#[AllowAnonymous]   // 无需登录、无需权限
public function login(Request $request) { /* ... */ }
```

## 权限数据来源

- 用户 → 角色 → 权限 的关系由 **Casbin RBAC** 维护（`config` 中配置策略存储）。
- 超级管理员：`CurrentUser::isSuperAdmin()` 短路放行。
- 前端菜单/按钮权限码与后端 `#[Permission]` 一一对应，由后端 `permission` 接口下发；前端在路由 meta 中声明 `permission` 做按钮级控制（见[前端 - 权限](../frontend/mono/permission.md)）。

## 令牌刷新

JWT 过期后，前端携带 `refreshToken` 调用刷新接口续期（令牌机制在 `core/security/jwt` 实现）。长连接（SSE）的鉴权失败会通过 `SseHelper` 以错误事件流返回，不会中断进程。

> 约定：新增后台接口务必声明 `#[Permission(code: ...)]`，否则默认走登录校验但无菜单权限绑定；开放给游客的接口必须显式 `#[AllowAnonymous]`。
