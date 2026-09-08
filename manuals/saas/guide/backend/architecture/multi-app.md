# 后端 · 多应用（Multi-App）

后端按「应用」拆分入口，彼此路径隔离、逻辑复用。

---

## 1. 三大应用

| 应用 | 目录 | 路径前缀 | 说明 |
| ---- | ---- | ---- | ---- |
| adminapi | `app/adminapi` | `/adminapi` | 后台管理全部接口 |
| api | `app/api` | `/api` | C 端 / 开放平台接口 |
| install | `app/install` | `/install` | 安装向导接口（装完可禁用） |

---

## 2. 共用与隔离

- **共用**：`service/`（admin、api、core）、`dao/`、`model/`、`enum/`、`scope/`、`event/` 等。
- **隔离**：`controller/`、`validate/`、`schema/`、`middleware/` 按应用分目录（如 `app/adminapi/middleware` 与 `app/api/middleware`）。
- 同一业务（如「会员」）的后台接口与 C 端接口可能调用同一个 `MemberService`，但校验与权限不同。

---

## 3. adminapi 内部结构

```text
app/adminapi/
├── controller/    # 按模块：system / member / content / ops / web / site / plugin
├── validate/      # 与 controller 模块对应
├── schema/        # request/ 与 response/ DTO（供 Swagger 生成文档）
├── middleware/    # AccessToken / Permission / Operation 等
└── route/         # 每模块一个路由文件（自动生成）
```

---

## 4. 路由注册

每个模块在 `route/<module>/<module>.php` 中：

```php
use app\adminapi\controller\sys_admin_dept\SysAdminDeptController;
use madong\swagger\util\RouteUtil;

// 由代码生成器自动生成，请勿手动修改
RouteUtil::registerRoutes(SysAdminDeptController::class);
```

- `RouteUtil::registerRoutes` 扫描 Controller 上的 Swagger 注解（`#[OA\Get]` 等）自动注册路由。
- 路由文件路径/类名变更后需重新生成（代码生成器）。

---

## 5. install 应用

- 仅在首次部署使用，提供环境检测、建库、初始化管理员等接口。
- 生产环境建议安装完成后在 `config/route.php` 或 Nginx 层禁用 `/install`。
- 详见 [`../frontend/mono/install/steps.md`](../frontend/mono/install/steps.md)。
