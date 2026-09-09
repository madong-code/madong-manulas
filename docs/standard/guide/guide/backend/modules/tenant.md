# 后端 · 多租户与数据权限

---

## 1. 两种隔离

- **scope（行级）**：同一套表，按租户/部门字段过滤行。
- **global（全局）**：跨租户共享数据（如平台级配置）走独立标记或连接。

---

## 2. 数据权限作用域

`app/scope/global/AccessPermissionScope` 是模型作用域，在查询时自动追加条件：

```php
$items = $service->selectList([], ['id','pid','name'], 0, 0, 'created_at', [], false, [AccessPermissionScope::class]);
```

- 依据当前用户角色的数据权限（`data_scope` + `scopes`）过滤可访问部门/数据。
- 超管跳过作用域（可见全部）。

---

## 3. 租户上下文

登录后 `AccessTokenMiddleware` 注入租户 ID，Service/Dao 查询自动带租户条件（通过 Scope 或基类）。

---

## 4. 约定

- 所有租户相关业务表带租户字段，查询经 Scope 过滤。
- 平台级数据用 `global` 标记，避免被租户过滤误删。
- 切换租户/部门后清除相关缓存。

> 详见 [rbac.md](./rbac.md) 的数据权限部分。
