# 应用插件

后端插件机制基于 Webman 的插件规范：**Webman 启动时自动扫描 `backend/plugin/` 目录并注册路由与配置**，无需手动引入。

> 重要：运行时后端只读取 `backend/plugin/`。`madong-market/*` 或 `template/*` 里的同名目录只是插件**模板源/安装包**，重新安装/同步时才会写入运行时目录，两边内容需保持一致。

## 目录约定

```
backend/plugin/
└── {plugin_name}/
    ├── config/
    │   ├── route.php        # 插件路由（按 Webman 插件规范）
    │   ├── review.php       # 审核类型扩展（可选）
    │   └── ...              # 其它配置（自动被系统扫描合并）
    ├── app/                 # 插件业务代码（controller/service/dao/model...）
    ├── api/                 # 对外 HTTP 接口
    ├── resource/            # 资源（迁移、语言包、数据）
    └── ...
```

## 插件如何被加载

1. Webman 启动（`start.php` / `windows.php`）扫描 `backend/plugin/` 下每个子目录。
2. 读取 `config/route.php` 注册路由；读取 `config/*.php` 合并进全局配置（如 `review.php` 的 `scan_plugins`）。
3. 插件业务类遵循与核心一致的 PSR-4 自动加载。

## 审核类型扩展（插件示例）

`config/review.php` 在系统侧 `scan_plugins => true` 时，会自动扫描各插件 `config/review.php` 并合并 `types` 与 `field_mappings`。例如官方插件在 `plugin/official/config/review.php` 中声明 `question` 审核类型，无需改核心。

## 新建插件

1. 在 `backend/plugin/` 下建立 `{plugin_name}/` 目录结构。
2. 编写 `config/route.php` 定义路由（参考 Webman 插件路由规范）。
3. 在 `app/` 下按四层架构组织业务代码（Controller→Service→Dao→Model）。
4. 如需扩展系统能力（如审核类型），在 `config/{feature}.php` 提供与系统一致的键结构，系统自动合并。
5. 重启后端使插件生效（`php start.php restart`）。

> 注意：插件后端代码必须放在 `backend/plugin/` 下，否则请求会 404；同时确保与模板源保持同步以便重新安装。

---

## 单体模式与租户模式下的插件

madong-saas 可在两种部署形态下运行，插件的管理入口与数据落点完全不同。一个关键区分是**「端」**：管理端（adminapi）与平台端（platform）在两种模式下承担的角色不同。理解这两套语义是排查"插件装了看不到 / 卸载了还残留 / 租户间数据串台"等问题的前提。

### 1. 两种运行模式与对应的「端」

系统通过 `config('tenant.mode')` 区分模式，进而决定有哪些「端」可用：

| 配置 | 模式 | 存在的「端」 | 插件管理入口 |
| --- | --- | --- | --- |
| `tenant.mode = single`（默认） | 单体模式 | 仅**管理端** | 管理端「入库」是唯一入口 |
| `tenant.mode = tenant` | 租户模式 | **平台端** + 各租户**管理端** | 平台端负责「下发管理」，管理端负责租户内使用 |

- 模式判定：`TenantContext::isSingleMode()`（`config('tenant.mode') === 'single'`）、`TenantContext::isTenantEnabled()`；编排器 `PluginLifecycleOrchestrator::mode()` 据此返回 `'single' | 'multi'`。
- 「端」的语义：管理端 = 运维后台（adminapi），在单体模式即全站唯一点；平台端 = SaaS 运营控制台（platform），只在租户模式下存在，负责把插件**「下发」**到各租户。

### 2. 单体模式：管理端唯一「入口」

单体模式下**只有管理端一个入口**，没有平台端，也没有租户隔离概念：

- 唯一入口是管理端的 `adminapi/controller/plugin/PluginController::install`（SSE 流式）/ `uninstall` / `destroy`，对应「模块市场 → 安装」；
- 底层仅调用 `installPlatform() / updatePlatform() / uninstallPlatform()`；`installForTenant() / updateForTenant() / uninstallForTenant()` 会直接抛 `BadMethodCallException`（见 `assertMultiMode()`："仅在多租户模式下可用"）；
- 无 `tenant_id` 概念，迁移与菜单**直接落主库**（`sys_plugin` / `sys_menu`）；
- **不写** `saas_tenant_plugin` / `saas_tenant_plugin_install` 等租户授权 / 运行态表；
- 一次安装全站生效，所有"租户"实际上是同一个主体。

> 即编排器注释中的「单体降级」：`isSingleMode() === true` 时，`*ForTenant()` 与 `*Platform()` 行为完全等价，只是语义上应统一走管理端「入库」→ Platform 入口。

### 3. 租户模式：平台端「下发管理」

租户模式下插件分**平台层**与**租户层**两级，且由**平台端**主导「下发」：

- **平台端安装**（`platform/controller/plugin/PluginInstallController::install`）：安装平台级插件代码 / 资源 / 平台菜单，底层走 `installPlatform()`；
- **平台端下发管理**（`platform/controller/plugin/PluginTenantAuthController`）：「租户授权」即把插件**下发**给指定租户，写入 `saas_tenant_plugin` 授权记录，进而触发该租户的 `installForTenant()`（生命周期由 `PluginLifecycleOrchestrator` 的「七入口」编排）；
- **租户侧管理端**（`adminapi/controller/plugin/TenantPluginController`）：租户在自己的管理端对**已授权**插件做启用 / 停用，互不影响其他租户。

七入口职责：

| 入口 | 作用域 | 说明 |
| --- | --- | --- |
| `installPlatform` | 平台层 | 安装插件共享代码 / 资源、平台菜单（共享表在字段隔离时由此创建） |
| `updatePlatform` / `uninstallPlatform` | 平台层 | 平台级升级 / 卸载（卸载默认要求「无占用租户」，`force` 可绕过触发级联） |
| `installForTenant` | 租户层 | 对**某个租户**执行迁移、租户菜单同步、租户配置，并写入授权 / 运行态记录 |
| `updateForTenant` / `uninstallForTenant` | 租户层 | 单租户升级 / 卸载，互不影响 |
| `cascadeUninstall` | 混合 | 强制级联：先逐租户卸载，再卸平台层，用于「占用阻断」场景 |

**隔离模式（isolation_mode）**：每个租户自身的 `Tenant.database_mode` 决定其数据落点（`resolveIsolationMode()` 必须读租户自身模式，不能依赖全局上下文，否则批量场景会把菜单 / 迁移写到错误的库）：

- `field`：共享主库，业务表带 `tenant_id` 列做行级隔离；
- `database`：独立租户库，迁移在租户库建表。

### 4. 平台插件 vs 租户插件（两者）的差异

同一个插件在租户模式里同时存在「平台层实例」与「若干租户层实例」，二者职责与落点不同：

| 维度 | 平台插件（平台层） | 租户插件（租户层） |
| --- | --- | --- |
| 管理端 / 平台端 | 平台端 `PluginInstallController` 安装 | 平台端 `PluginTenantAuthController` 下发授权 → 触发 `installForTenant` |
| 生效范围 | 全系统 / 所有租户共享 | 仅指定租户（下发到谁，谁可用） |
| 菜单落点 | 平台 `sys_menu` | 各租户库 `sys_menu`（按隔离模式） |
| 数据迁移 | 共享表（field 模式在此建表） | 租户库建表（database 模式）或共享表行数据 |
| 配置 | 平台级 | 租户级 `sys_config` |
| 治理记录 | `sys_plugin` | `saas_tenant_plugin`（授权）+ `saas_tenant_plugin_install`（运行态） |
| 卸载影响 | 移除代码 / 平台菜单，**会阻断**若有租户占用 | 仅清该租户菜单 / 配置 / 迁移，**不影响其他租户** |
| 单体模式下 | 通过管理端「入库」可用 | 不可用（抛异常） |

> "两者插件"即指同时具备平台层与租户层能力的插件：平台层负责「一次装好的共享能力」，租户层（由平台端下发）负责「按租户按需开通」。占用清单接口（`getOccupying`）读的是 `saas_tenant_plugin_install.status = 1`，因此**即使只删了 `saas_tenant_plugin` 而漏删 `saas_tenant_plugin_install`，该租户仍会错误显示在卸载后的占用列表里**（这正是 `uninstallForTenant` 需同步清理两张表的原因）。

### 5. 关键代码位置

- 模式判定：`core/business/tenant/context/TenantContext.php`（`isSingleMode` / `isTenantEnabled` / `getIsolationMode`）
- 编排与七入口：`app/service/core/plugin/PluginLifecycleOrchestrator.php`（`assertMultiMode` / `mode` / `resolveIsolationMode` / `installForTenant` / `uninstallForTenant` / `cascadeUninstall`）
- 管理端入库：`app/adminapi/controller/plugin/PluginController.php`（install / uninstall / destroy）
- 平台端下发：`app/platform/controller/plugin/PluginInstallController.php`（平台安装）、`app/platform/controller/plugin/PluginTenantAuthController.php`（租户授权 = 下发）
- 租户侧启用：`app/adminapi/controller/plugin/TenantPluginController.php`
- 数据表：`sys_plugin`（平台插件注册）、`saas_tenant_plugin`（租户授权治理）、`saas_tenant_plugin_install`（租户安装运行态）
