# 升级与兼容

## 升级原则

- **框架核心不动**：`backend/core/` 与前端 `packages/scripts/internal` 为受保护目录，升级只更新业务代码与依赖，不回退/改写核心。
- **先读 changelog**：升级前查看本文档[更新日志](changelog.md) 与 `skills/README.md` 的版本说明。
- **先迁数据库**：执行迁移脚本 `php start.php migrate`，确认无破坏式字段变更。
- **再装依赖**：`composer update`（后端）、`pnpm install`（前端）。
- **重启服务**：升级后务必 `php start.php restart`。

## 跨版本注意

- **PHP 8.2+**：核心使用 PHP 8.2 特性，升级运行环境请保证 >= 8.2。
- **Eloquent 11**：ORM 为 Laravel Illuminate 11，避免依赖旧版 think-orm 写法。
- **admin UI 替换**：`template/mono/apps/admin` 是固定位置、可整体换 UI 的模版，靠 `package.json` 的 `name` 区分当前 UI（如 `vue-vben-admin-ele` / `madong-vue`）。替换 UI 时**后端契约不变**，只需保证新模版调用相同 API。
- **插件兼容**：插件运行时在 `backend/plugin/`；升级若改了插件 API，需同步更新插件与模板源。

## 数据备份

升级前务必备份：

- 数据库（全量 dump）。
- `backend/.env`（配置）。
- `public/admin`、`public/platform`、`public/web`、`public/install` 构建产物（可重新构建，建议保留旧版本以便回滚）。

## 回滚

1. 恢复数据库 dump。
2. 恢复旧版代码（`git checkout` 到稳定 tag）。
3. 重新 `composer install` / `pnpm install` 并重启。

> 生产环境升级建议在隔离环境先验证，确认迁移与前端构建无误后再上线。
