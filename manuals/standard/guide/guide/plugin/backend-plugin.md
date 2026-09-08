# 插件 · 后端

插件后端代码放在 `plugin/<name>/app/`，结构与业务 `app/` 一致，但命名空间以 `plugin\<name>\` 开头。

---

## 1. 目录结构

```text
plugin/<name>/app/
├── adminapi/
│   ├── controller/   # 控制器（继承 core Crud）
│   ├── validate/     # 校验器
│   ├── schema/       # 请求/响应 DTO
│   └── route/        # 路由注册（RouteUtil::registerRoutes）
├── api/              # C 端接口
├── dao/ model/ service/
└── generator/       # 代码生成逻辑（如 codegen 插件）
```

---

## 2. 控制器示例（约定）

与业务控制器完全一致，继承 `core\foundation\base\Crud`，用 Swagger 注解 + `#[Permission(code)]`：

```php
#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class)]
final class XxxController extends Crud
{
    public function __construct(XxxService $service, XxxValidate $validate)
    {
        $this->service  = $service;
        $this->validate = $validate;
    }
}
```

---

## 3. 路由注册

```php
// plugin/<name>/app/adminapi/route/xxx/xxx.php
use plugin\<name>\app\adminapi\controller\XxxController;
use madong\swagger\util\RouteUtil;

RouteUtil::registerRoutes(XxxController::class);
```

---

## 4. 数据库

- 建表 SQL / 迁移放 `resource/database/`（安装时执行）。
- 或安装流程调用 Phinx 迁移（见 [`backend/advanced/migration.md`](../backend/advanced/migration.md)）。

---

## 5. 注意

- 插件后端运行时目录是 `plugin/<name>/app/**`，**不是** `resource/template/**`。
- 改后端必须改对位置，否则请求 404（与 portal 插件经验一致）。
- 插件间的 Service 复用走 `Container::make`。
