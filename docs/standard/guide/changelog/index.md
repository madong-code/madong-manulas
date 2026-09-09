# 9 更新日志

> 本文档按版本记录主要变更。升级前请先阅读[升级指南](./upgrade.md)、[部署](../deploy/index.md) 与[二开 - 升级与兼容](../dev-guide/upgrade.md)。

## 版本记录

> 单文件模式：下方为版本索引，点击可跳转至同页「[各版本详情](#各版本详情)」；当前标准版的完整能力见 [v5.x（当前标准版）](#v5x)。v5.1 系列另有独立文件：[v5.1 更新日志](./v5.1.md)。

- [v5.1](./v5.1.md) — v5.1 系列：架构与核心能力总览（独立文件）
- [v5.1.3](#v513) — 2026-09-02：租户插件体系重构（授权与安装态拆分、生命周期编排、平台分发中心）*（SaaS 多租户版专属）*
- [v5.1.2](#v512) — 2026-08-04：站点配置字段统一、页脚重构、租户时间字段时间戳化、字典索引调整
- [v5.1.1](#v511) — 2026-07-29：内容审核模块、上传存储抽象重构、租户建库幂等优化
- [v5.1.0](#v510) — 2026-07-22：多租户 SaaS 模板体系、安装器与租户隔离增强、Web 前端全量重构
- [v5.0.1](#v501) — 2026-07-01：键值编辑与富文本组件、依赖更新
- [v5.0.0](#v500) — 2026-06-25：文档体系、Web 终端、插件市场、代码生成器
- [v5.0](#v50) — 初始版本：webman 2.x + ThinkORM + mono 前端 + 插件系统 + 代码生成器

## v5.x（当前标准版） {#v5x}

### 架构

- 后端：PHP 8.2+ / Webman 2.2 / Laravel Illuminate Database 11（非 think-orm）。
- 后台前端：`template/admin`，Vben Admin 5.7 内核（inline `src/core/`），Vue 3 + Element Plus，pnpm monorepo，Node ^22.18 || ^24。
- 前台前端：`template/web`，Nuxt 4（当前 `ssr: false`，3 种路由模式 frontend/backend/hybrid）。
- 安装向导：`template/install`，轻量 SPA，6 步 + SSE 进度，生成 `install.lock`。

### 后端能力

- 严格四层架构：Controller → Service → Dao → Model（仅向下依赖）。
- OpenAPI 注解路由（`#[OA\...]`），自动生成 `/adminapi/openapi` 文档。
- JWT 鉴权 + `#[Permission(code)]` 注解 + Casbin RBAC 权限体系。
- 通用 `Crud` 控制器（列表/增删改/回收站/导入导出）。
- 内置高级能力：Web 终端（phpseclib + SSE）、应用插件（运行时 `backend/plugin/`）、查询构造器（`madong/query` 的前缀过滤）、消息推送（`MessagePusher` + webman/push WebSocket）、内容审核（可插件扩展类型）。
- Phinx 迁移、Redis 3 连接组、MySQL 表前缀 `md_`。

### 前端能力

- admin：`useCrud` + `CrudSchema` 声明式 CRUD、`BaseService` 请求封装、`CellDictTag`/`ApiDict` 字典渲染、前缀约定、`$t` 国际化、角色/权限路由守卫。
- web：`request`（fetch 默认导出）、`routes.ts` meta、多租户 `X-Tenant-Id`、Token 刷新队列、SSE。

### 工具链

- `skills/` AI 技能库，覆盖后端/前端/主题，支持 CodeBuddy/Cursor/Trae/Copilot 同步。
- 脚手架命令：`madong-make:*`（单文件）、`madong-plugin:*`（插件）、`install:madong` 等。
- 部署模板：admin `nginx.conf` + `Dockerfile`、web `Dockerfile`、Supervisor 配置。

## 升级提示

- 从旧版升级需：读 changelog → 执行迁移 → `composer update` / `pnpm install` → 重新构建前端 → 重启服务。
- 框架核心（`backend/core/`、前端 `packages/scripts/internal`）保持只读，不随业务升级改写。

---

## 各版本详情

### v5.1.3 {#v513}

> 发布日期：2026-09-02 · SaaS 多租户版专属

- 租户插件体系重构：授权治理与安装运行态拆分，新增插件生命周期编排器与批量执行器
- 平台端新增插件租户分发中心（授权 / 分发双页签、矩阵与升级统计）
- 管理端模块市场重构为租户版
- 数据库新增租户插件相关迁移；需重启 `plugin-sync-consumer` 进程

*标准版不涉及租户插件体系，上述变更仅适用于 SaaS 多租户版。*

### v5.1.2 {#v512}

- 站点配置字段统一、页脚重构
- 租户时间字段时间戳化、字典索引调整

### v5.1.1 {#v511}

- 内容审核模块、上传存储抽象重构
- 租户建库幂等优化

### v5.1.0 {#v510}

- 多租户 SaaS 模板体系、安装器与租户隔离增强
- Web 前端全量重构

### v5.0.1 {#v501}

- 键值编辑与富文本组件
- 依赖更新

### v5.0.0 {#v500}

- 文档体系、Web 终端、插件市场、代码生成器

### v5.0 {#v50}

- 初始版本：webman 2.x + ThinkORM + mono 前端 + 插件系统 + 代码生成器

---

*具体补丁版本与 breaking change 请以 `composer.json` / `package.json` 锁定版本及仓库 tag 为准；跨版本升级步骤见 [升级指南](./upgrade.md)。*
