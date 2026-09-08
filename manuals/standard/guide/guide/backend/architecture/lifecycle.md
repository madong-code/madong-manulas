# 后端 · 请求生命周期

一次 `/adminapi/system/role` 请求的全过程：

```text
① Nginx 反代
   └─► 转发到 Webman（http://127.0.0.1:8500）

② Webman Worker（常驻内存）
   └─► 解析 HTTP，构造 support\Request

③ 中间件栈（按注册顺序）
   a. AccessTokenMiddleware  解析 JWT → 注入当前用户上下文
   b. PermissionMiddleware   校验 #[Permission(code)] → Casbin 鉴权
   c. OperationMiddleware    记录操作日志（可选）

④ 路由分发
   └─► RouteUtil 按 Swagger 注解找到 RoleController::index

⑤ Controller
   └─► parent::index($request)
        ├─ 调 $this->validate->scene('list')->check()（如有）
        ├─ 调 $this->service->list($params)
        │     └─► $this->dao->list(...) → Model 查询 MySQL
        └─ 返回 Json::success($data)

⑥ 响应
   └─► Json::success → JSON → Webman → Nginx → 浏览器
```

---

## 常驻内存注意

- Webman 进程**常驻**，类在首次加载后常驻内存。
- 改了类/命名空间必须 `composer dump-autoload`；开发环境可开启 `monitor` 进程自动重载。
- **禁止**在代码中写全局单例状态跨请求共享（除非明确用 `Container` 作用域）；请求间状态隔离靠 `Request`/`Container` 每次新建。
- 配置变更需重启进程生效（`php webman restart`）。

---

## 中间件顺序

`config/middleware.php` 注册全局中间件；类上的 `#[Middleware(...)]` 为控制器/方法级。执行顺序：全局 → 类级 → 方法级。
