# 租户隔离模式

Madong-Saas 提供三种租户策略，由 `config/tenant.php` 统一配置：

| 模式 | 值 | 隔离方式 | 数据形态 | 适用场景 |
| --- | --- | --- | --- | --- |
| 单租户 | `single` | 不隔离 | 共享 | 标准版 |
| 字段隔离 | `field` | `tenant_id` 字段 | 共享表 | 多数 SaaS |
| 库隔离 | `database` | 独立数据库 | 物理隔离 | 高安全需求 |

## 1. 单租户模式（single）

默认模式，未启用多租户时生效：

```php
// config/tenant.php
'enable' => env('APP_TENANT_ENABLED', false), // false 时不隔离
'mode'   => env('APP_TENANT_ENABLED', false) ? 'field' : 'single',
```

- 所有数据共享，无 `tenant_id` 过滤
- 适合私有部署、单客户

## 2. 字段隔离（field）

所有租户共用一张表，通过 `tenant_id` 字段区分：

```php
'default_mode' => 'field',
'field_isolation' => [
    'tenant_column' => 'tenant_id',  // 租户标识字段
    'admin_bypass' => false,         // 管理员是否跳过（默认不跳过）
    'auto_inject' => true,           // 全局自动注入租户 ID
],
```

### 工作原理

- 数据库查询时通过**全局作用域**自动附加 `WHERE tenant_id = {当前租户}`
- 新增/更新时自动注入当前租户 ID
- 支持 `whitelist` 白名单，排除不需要租户过滤的模型

### 跨租户隔离

```php
'security' => [
    'cross_tenant_access' => [
        'allow_query' => false,  // 禁止跨租户查询
        'allow_write' => false,  // 禁止跨租户写入
    ],
],
```

默认**禁止**跨租户访问，可针对性开启。

## 3. 库隔离（database）

每个租户独立数据库，物理隔离：

```php
'database_isolation' => [
    'connection_template' => null,                       // 连接模板（默认复用主库 host/port/user/pass）
    'database_pattern' => 'saas_tenant_{tenant_id}',     // 租户库命名
    'pool' => [
        'min_connections' => 1,
        'max_connections' => 10,
        'wait_timeout' => 30,
    ],
    'migration_path' => 'resource/database/migrations',  // 复用主库迁移文件
],
```

### 工作原理

- 按 `{tenant_id}` 动态创建租户数据库连接
- 租户库共用主库迁移文件（统一维护一份）
- 通过连接池复用连接，避免频繁建连

### 字段隔离 → 库隔离迁移

使用命令 `tenant:migrate-data` 将字段隔离租户的数据迁移到独立库：

```bash
# 迁移指定租户
php webman tenant:migrate-data -t 1,2,3
# 迁移所有 active 租户（预览）
php webman tenant:migrate-data -a --dry-run
```

四步流程：创建租户库 → 运行租户迁移 → 复制数据（`INSERT ... SELECT WHERE tenant_id = ?`）→ 更新租户模式。

## 按模块隔离

不同模块可配置不同隔离策略：

```php
'module_modes' => [
    'system_config' => 'field',
    'business'      => 'field',
    'sensitive'     => 'database',  // 敏感数据用库隔离
    'customer'      => 'field',
],
```

## 切换隔离模式

1. 编辑 `config/tenant.php` 的 `mode` / `default_mode` / `module_modes`
2. 多租户数据库操作通过 `TenantScope` / 全局作用域自动生效
3. 库隔离模式下新建租户需初始化租户库（运行迁移）

## 下一步

- [标准版与多租户版](./standard-vs-saas.md)
- [订阅与套餐](./subscription.md)
