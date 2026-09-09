# 开发规范 · 后端

---

## 1. 命名

- 目录/文件：`PascalCase`（如 `RoleController.php`、`RoleService.php`）。
- 类：`PascalCase`；方法/变量：`camelCase`。
- 命名空间与目录严格对应：`app/adminapi/controller/system/RoleController` ↔ `app\adminapi\controller\system\RoleController`。
- 表：`snake_case` 带前缀 `mic_`（如 `mic_system_role`）。

---

## 2. 分层纪律

- **Controller**：只收参、调 Service、出 JSON，**不含业务**。继承 `Crud` 复用标准动作。
- **Service**：业务编排、事务，**不直接写 SQL**（走 Dao）。
- **Dao**：查询封装，**不写跨表业务**。
- **Model**：表映射、字段类型（`$casts`），**不放复杂逻辑**。
- 内核 `core/` **不可改**；业务只在 `app/`。

---

## 3. 注解与权限

- 每个接口方法加 Swagger 注解（`#[OA\Get]` 等）+ `#[Permission(code)]`。
- 权限码格式 `module:entity:action`（如 `system:role:update`）。
- 控制器/方法加 `#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class, OperationMiddleware::class)]`。

---

## 4. 响应

- 统一 `Json::success` / `Json::fail`。
- 列表返回 `{ items, total, page, pageSize }`。
- 业务错误抛 `AdminException`（带码）。

---

## 5. 校验

- 入参用 Validate + `scene`；更新场景 `Rule::unique` 自动 `ignore`。
- 字段白名单用 `inputFilter($all, $allow)` 防越权。

---

## 6. 注释与类型

- 开启 `declare(strict_types=1)`。
- 方法参数/返回尽量类型声明。
- 关键业务写 PHPDoc 说明意图（非显而易见处）。

---

## 7. 依赖注入

- 构造函数声明类型，PHP-DI 自动注入（见 [`backend/architecture/container.md`](../backend/architecture/container.md)）。
- 静态上下文用 `Container::make`。
