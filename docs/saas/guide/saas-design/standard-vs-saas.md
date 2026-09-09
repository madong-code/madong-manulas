# 标准版与多租户版

Madong-Saas 通过环境变量 `APP_TENANT_ENABLED` 在**标准版（单租户）**与**多租户版（SaaS）**之间切换。

## 快速对比

| 维度 | 标准版（Standard） | 多租户版（SaaS） |
| --- | --- | --- |
| 租户 | 无（单一系统） | 多租户 |
| 隔离模式 | `single` | `field` / `database` |
| 订阅计费 | 无 | 有（Subscription） |
| 平台管理 | 无 | 有（platform 应用） |
| 前端 `X-Tenant-Id` | 不注入 | 注入 |
| 数据表 | 共享 | 按隔离模式共享/独立 |
| 适用场景 | 私有部署 | 云托管、多客户 |

## 切换方式

在 `.env` 中设置：

```env
# ===== 标准版 =====
APP_TENANT_ENABLED=false

# ===== 多租户版 =====
APP_TENANT_ENABLED=true
```

`config/tenant.php` 根据该变量自动推导：

```php
'enable' => env('APP_TENANT_ENABLED', false),
'mode'   => env('APP_TENANT_ENABLED', false) ? 'field' : 'single',
```

> 多租户模式下 `mode` 默认 `field`（字段隔离），可通过 `default_mode` 改为 `database`。

## 菜单差异

多租户模式下，不同租户拥有**独立的菜单**：

- 菜单来源：`saas_template_menu`（菜单模板表），新建租户时从模板复制菜单树
- 同步命令：`madong:migrate-menu-template`（多租户） vs `madong:migrate-admin-menu`（单租户）

> 单租户使用 `sys_menu(app='admin')`；多租户使用 `saas_template_menu(app='admin')` 模板。两条命令互斥，按当前模式选择。

## 前后端差异

### 后端

- **多租户**：启用 `TenantScope` 全局作用域、`X-Tenant-Id` 上下文、订阅校验
- **标准版**：无需租户上下文，逻辑更简单

### 前端（admin）

多租户下请求拦截器自动注入租户头：

```typescript
// apps/admin/src/api/request.ts
if (accessStore.tenantId && !isSaasManagementUrl(config.url)) {
  config.headers['X-Tenant-Id'] = String(accessStore.tenantId);
}
```

排除 SaaS 管理接口：`/tenant`、`/db-settings`、`/db-drivers`、`/subscription`。

### 前端（platform）

平台应用（`platform`）无租户上下文，不注入 `X-Tenant-Id`，负责租户/订阅/监控等平台级管理。

## 选择建议

| 你的场景 | 推荐模式 |
| --- | --- |
| 单客户私有部署 | 标准版 |
| 多客户云服务，租户数据独立 | 多租户版（字段隔离） |
| 金融/高安全，租户数据强隔离 | 多租户版（库隔离） |

## 下一步

- [租户隔离模式](./tenancy.md)
- [订阅与套餐](./subscription.md)
