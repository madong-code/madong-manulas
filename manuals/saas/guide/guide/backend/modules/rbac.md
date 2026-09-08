# 后端 · RBAC 权限

基于 **Casbin** 的角色权限控制，权限码为 `module:entity:action` 形式（如 `system:role:list`）。

---

## 1. 三层模型

- **用户（User）**：管理员/会员，归属角色。
- **角色（Role）**：聚合一组权限码，可带数据权限（`data_scope`）。
- **权限码（Permission）**：最小授权单位，绑定到接口（`#[Permission(code)]`）与前端按钮（`code`）。

---

## 2. 权限校验

- 接口侧：`PermissionMiddleware` 读取 `#[Permission(code)]`，查 Casbin 当前用户是否拥有。
- 前端侧：`useAccess` / `v-access` 按 `meta.authority` 与按钮 `code` 控制可见（见 [`frontend/common/access.md`](../frontend/common/access.md)）。
- 超管：`superCodes = ['*']`，放行所有。

---

## 3. 数据权限（Data Scope）

角色可配数据范围（`data_scope` + `scopes`）：
- 全部
- 自定义部门
- 仅本人
- 仅本部门

由 `app/scope/global/AccessPermissionScope` 在查询时自动追加部门/用户过滤条件（见 [tenant.md](./tenant.md)）。

---

## 4. 角色接口示例

`RoleController` 提供：
- 列表/详情/新增/更新/删除（标准 CRUD）
- `PUT /system/role/{id}/data-scope`：分配数据权限
- `PUT /system/role/{id}/change-status`：切换状态

---

## 5. 约定

- 新增接口**必须**加 `#[Permission(code)]`，否则任何人可访问。
- 权限码命名统一 `module:entity:action`。
- 前端 `meta.authority` 与后端权限码一致，否则菜单/按钮错乱。
