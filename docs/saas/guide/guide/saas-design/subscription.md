# 订阅与套餐

多租户版通过**功能订阅（Subscription）**控制租户可用的功能与权限，实现按套餐计费。

## 配置

```php
// config/tenant.php
'subscription' => [
    'enabled' => true,          // 是否启用功能订阅
    'check_interval' => 24,     // 订阅过期检查周期（小时）
    'grace_period' => 7,        // 宽限期（天），过期后仍可用的天数
    'permission_table' => 'saas_subscription_permission', // 套餐-权限关联表
],
```

## 核心表与模型

| 数据 | 模型 | 说明 |
| --- | --- | --- |
| 租户 | `app\model\tenant\Tenant` | 租户实体 |
| 订阅 | `app\model\tenant\Subscription` | 租户当前订阅的套餐 |
| 权限定义 | `app\model\tenant\Permission` | 可授予的权限项 |
| 套餐-权限 | `app\model\tenant\SubscriptionPermission` | 套餐与权限的关联 |

关联关系：

```
Tenant 1──1 Subscription N──1 Permission
                        └──N SubscriptionPermission
```

## 工作流程

1. **开通租户**：创建 Tenant + 默认 Subscription
2. **分配套餐**：为订阅绑定一组权限（`SubscriptionPermission`）
3. **鉴权**：租户内请求校验当前权限是否在订阅允许范围内
4. **过期处理**：订阅到期进入宽限期（默认 7 天），超期后禁用相关功能

## 过期检查

系统按 `check_interval`（默认 24 小时）周期性检查订阅过期状态。过期策略：

- 宽限期（`grace_period`，默认 7 天）内仍可正常使用
- 超过宽限期后，超出套餐的功能将被禁用
- 敏感操作（创建/删除租户、变更订阅）会记录审计日志

## 订阅相关接口

前端（admin）中以下接口属于**平台级/订阅管理**，请求**不注入** `X-Tenant-Id`：

- `/subscription` - 订阅管理
- `/tenant` - 租户管理
- `/db-settings` / `/db-drivers` - 租户数据库配置

## 平台端管理

平台应用（`platform`）负责订阅的创建、变更、续费、过期处理，通过 `TENANT_PLATFORM_API_URL` 等与租户后台联动（见 `config/tenant.php` 的 `platform` 配置）。

## 下一步

- [租户隔离模式](./tenancy.md)
- [标准版与多租户版](./standard-vs-saas.md)
