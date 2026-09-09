# Mono 项目结构详解

本文详细介绍 Madong 前端 Mono 项目（`template/mono`）的真实目录结构。

## 整体架构

Mono 是基于 **pnpm + turbo** 的 monorepo（vben-admin-monorepo），同时承载 Admin / Platform / Install 三个应用，共享 `packages/*` 核心代码。用户端 `web`（Nuxt）与 mono 并列，不在此仓库内。

```
template/mono/                      # Mono 根目录（vben-admin-monorepo）
├── package.json                    # 根 package.json（turbo 编排、共享脚本）
├── pnpm-workspace.yaml             # pnpm 工作区（packages/apps/internal/scripts/docs/playground）
├── turbo.json                      # turbo 任务编排（dev/build 按依赖图并发）
├── lefthook.yml                    # Git 钩子（commit lint）
├── apps/                           # 业务应用（各自独立构建/部署）
│   ├── admin/                      # Admin 应用（@madong/admin，端口 5777，多租户）
│   ├── platform/                   # Platform 应用（@madong/platform，端口 5500，平台级）
│   ├── install/                    # Install 应用（@madong/install，端口 5888，独立轻量）
│   └── backend-mock/               # 后端 Mock（Nitro）
├── packages/                       # 共享包（受保护，仅消费不修改）
│   ├── @core/                      # 框架核心（ui-kit / base / forward）
│   ├── effects/                    # 业务效果（access / layouts / common-ui / plugins）
│   ├── constants/                  # 常量
│   ├── icons/                      # 图标
│   ├── lib/                        # 工具库
│   ├── locales/                    # 框架国际化
│   ├── preferences/                # 偏好定义
│   ├── stores/                     # 全局 Store
│   ├── styles/                     # 样式与设计变量
│   ├── types/                      # 类型定义
│   └── utils/                      # 通用工具
├── internal/                       # 内部工具（受保护：lint-configs / node / vite-config）
├── scripts/                        # 构建脚本（受保护）
├── docs/                           # 上游文档（vben）
└── playground/                     # 上游示例（vben）
```

## 共享包 `packages/`

所有应用共用 `packages/*`，通过 pnpm `workspace:*` 协议引用（如 `@vben/request`、`@vben/common-ui`、`@vben/access`）。

> ⚠️ **受保护**：`packages/*`、`internal/*`、`scripts/*` 来自 vben 上游，**不直接修改**。业务代码只改 `apps/{app}` 内部。

## 应用目录 `apps/`

三个应用的骨架高度一致，共享同一套 `packages/@core` 内核，各自通过 `src/adapter/` 适配层接入 UI 组件。差异点集中在**业务模块、租户能力、代理前缀**。

### `apps/admin/`（Admin 后台）

多租户 SaaS 后台，含 10 个业务模块，特有 `tenant-switch`（租户切换）、`terminal`（Web 终端）、`utils/sse`，请求注入 `X-Tenant-Id` 头。详见 [Admin 项目结构](./admin/structure.md)。

### `apps/platform/`（Platform 平台）

平台级管理（租户/数据库/监控），无多租户头注入，特有 `notification-drawer`（消息通知抽屉）。详见 [Platform 项目结构](./platform/structure.md)。

### `apps/install/`（Install 安装向导）

独立轻量 SPA，不依赖 vben 内核，`main.ts` 直接 `createApp + ElementPlus + Pinia`，6 步安装流程 + SSE 进度。详见 [Install 应用介绍](./install/intro.md)。

## 关键配置文件

### `pnpm-workspace.yaml`

```yaml
packages:
  - internal/*
  - internal/lint-configs/*
  - packages/*
  - packages/@core/base/*
  - packages/@core/ui-kit/*
  - packages/@core/forward/*
  - packages/@core/*
  - packages/effects/*
  - packages/business/*
  - packages/lib/*
  - apps/*
  - scripts/*
  - docs
  - playground
```

### 根 `package.json`（共享脚本）

```json
{
  "name": "vben-admin-monorepo",
  "version": "5.7.0",
  "scripts": {
    "dev": "turbo-run dev",
    "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 turbo build",
    "build:analyze": "turbo build:analyze",
    "preview": "turbo-run preview",
    "lint": "vsh lint",
    "format": "vsh lint --format",
    "typecheck": "turbo run typecheck",
    "check": "pnpm run check:circular && pnpm run check:dep && pnpm run check:type && pnpm check:cspell",
    "test:unit": "vitest run --dom",
    "commit": "czg"
  }
}
```

> 所有共享脚本都通过 **turbo** 编排，`pnpm dev` 会按依赖图并发启动所有应用。

## 依赖管理

- **共享依赖**：定义在根 `package.json` 与 `pnpm-workspace.yaml` 的 `catalog` 中，只安装一次（`node_modules/.pnpm`）。
- **版本目录（catalog）**：`pnpm-workspace.yaml` 的 `catalog:` 集中声明 Vue、Element Plus、Vite 等版本，各包用 `catalog:` 引用，统一升级。
- **应用依赖**：各应用在自身 `package.json` 声明，引用 `workspace:*` 共享包。
- **软链接**：pnpm 自动将 `packages/*` 软链到 `apps/{app}/node_modules/@vben/*`，实现代码共享。

## 下一步

- [共享配置详解](./config.md)
- [Admin 应用结构](./admin/structure.md)
- [Platform 应用结构](./platform/structure.md)
