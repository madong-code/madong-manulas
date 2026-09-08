# Mono - 介绍

Mono 是 Madong 前端管理端的 **monorepo 共享核心**，基于 **pnpm + turbo** 工作区，同时承载 **Admin（后台）**、**Platform（平台）**、**Install（安装向导）** 三个应用。与 Nuxt 的 `template/web`（用户端）并列。

## Mono 架构

```
template/mono/                  # Mono 共享核心（vben-admin-monorepo）
├── package.json                # 共享脚本（dev / build / build:integrated）
├── pnpm-workspace.yaml         # pnpm 工作区配置
├── turbo.json                  # turbo 任务编排
├── packages/                   # 共享包（受保护，仅消费不修改）
│   ├── @core/                  # 框架核心（UI / Store / Preferences / Router / API）
│   ├── effects/                # 业务效果（access / layouts / common-ui）
│   ├── utils/                  # 通用工具
│   ├── stores/                 # 全局 Store
│   ├── styles/                 # 样式与设计变量
│   ├── icons/                  # 图标
│   ├── locales/                # 框架国际化
│   ├── preferences/            # 偏好定义
│   ├── constants/              # 常量
│   ├── lib/                    # 工具库
│   └── types/                  # 类型定义
├── apps/                       # 业务应用
│   ├── admin/                  # Admin 应用（@madong/admin，端口 5777）
│   ├── platform/               # Platform 应用（@madong/platform，端口 5500）
│   └── install/                # Install 应用（@madong/install，端口 5888）
└── internal/                   # 内部工具（受保护）
```

> 注：`packages/`、`internal/`、`scripts/` 为 vben 上游受保护代码，业务开发在 `apps/{admin,platform,install}` 内部进行。

## 核心概念

### 1. Monorepo（单仓库多应用）
- **一个仓库** 管理 admin / platform / install 三个应用
- **共享代码** 通过 `packages/*` 复用（pnpm workspace protocol）
- **独立部署** 每个应用可单独构建、部署

### 2. pnpm Workspace + Turbo
- **依赖提升**：共享依赖只安装一次（`node_modules/.pnpm`）
- **任务编排**：`turbo-run dev` / `turbo build` 按依赖图并发执行
- **过滤脚本**：`pnpm --filter @madong/admin dev` 启动指定应用

### 3. 应用与端口

| 应用 | 包名 | 端口 | 用途 |
|------|------|------|------|
| Admin | `@madong/admin` | `5777` | 超级管理员后台（多租户） |
| Platform | `@madong/platform` | `5500` | 租户/平台管理员后台 |
| Install | `@madong/install` | `5888` | 安装向导（独立轻量） |

端口来源于各应用 `.env.development` 中的 `VITE_PORT`。

## 快速开始

### 环境要求
- Node.js ^20.19.0 || ^22.18.0 || ^24.0.0
- pnpm >= 10

### 安装依赖
```bash
cd template/mono
pnpm install
```

### 启动应用
```bash
# 启动所有应用（turbo 并行）
pnpm dev

# 启动指定应用
pnpm --filter @madong/admin dev
pnpm --filter @madong/platform dev
pnpm --filter @madong/install dev
```

### 构建应用
```bash
# 构建所有应用（turbo）
pnpm build

# 构建指定应用
pnpm --filter @madong/admin build

# 集成构建（产物输出到 backend/public/admin 等供后端发布）
pnpm build:integrated
```

## 目录结构详解

### `apps/admin/`（Admin 应用）
```
apps/admin/
├── src/
│   ├── main.ts              # 应用入口
│   ├── bootstrap.ts         # 启动引导
│   ├── preferences.ts       # 偏好配置
│   ├── api/                 # API 层（含 SSE）
│   ├── components/          # 业务组件
│   ├── router/              # 路由（后端菜单驱动）
│   ├── store/               # 状态管理（auth 含多租户）
│   ├── views/               # 业务页面（system/member/goods/...）
│   ├── lang/                # 业务国际化
│   └── locales/             # 框架国际化覆盖
├── .env.development         # VITE_PORT=5777、VITE_BASE_API=/adminapi
├── vite.config.ts
└── package.json             # name=@madong/admin
```

### `apps/platform/`（Platform 应用）
```
apps/platform/
├── src/
│   ├── main.ts
│   ├── bootstrap.ts
│   ├── preferences.ts
│   ├── api/
│   ├── components/
│   ├── router/              # 后端菜单驱动（无多租户头）
│   ├── store/
│   ├── views/
│   └── locales/
├── .env.development         # VITE_PORT=5500、VITE_BASE_API=/platformapi
├── vite.config.ts
└── package.json             # name=@madong/platform
```

### `apps/install/`（Install 应用）
```
apps/install/
├── src/
│   ├── main.ts              # 直接 createApp + ElementPlus + Pinia
│   ├── App.vue              # 6 步安装流程容器
│   ├── api/
│   ├── components/          # agreement/environment/database/.../complete
│   └── store/module/install.ts  # 选项式 API + SSE
├── .env
├── vite.config.ts
└── package.json             # name=@madong/install
```

## 开发规范

### 1. 受保护代码
`packages/*`、`internal/*`、`scripts/*` 来自 vben 上游，**不直接修改**。需要定制请通过本地覆盖、扩展或在 `apps/{app}` 内局部替换。

### 2. 新增业务功能
放在对应 `apps/{app}/src/views/` 或 `apps/{app}/src/components/` 下；跨应用复用可抽取到 `packages/effects/` 或新建共享包。

### 3. 环境与代理
每个应用自带 `.env.development`，配置 `VITE_PORT`、`VITE_BASE_API`、后端地址等。Vite 代理以 `/adminapi` / `/platformapi` 等前缀转发到后端 8500 端口。

## 常见问题

### Q: 如何新增业务应用？
A: 在 `apps/` 下新建目录，按 vben 模板初始化 `package.json`（`name: @madong/<app>`），复用 `packages/@core` 等共享包即可。

### Q: 三端 admin/platform/install 的差异？
A: 见上方"应用与端口"表与各应用 intro 页。重点：
- Admin 多租户（SSE、WebTerminal）
- Platform 单租户、无 WebSocket
- Install 独立轻量、不依赖 vben

### Q: 集成构建产物去哪？
A: `pnpm build:integrated` 输出至 `backend/public/{admin,platform,install,web}`，由后端 webman 静态托管。

## 下一步

- [Admin 应用介绍](./admin/intro.md)
- [Platform 应用介绍](./platform/intro.md)
- [Install 应用介绍](./install/intro.md)
- [Web 用户端介绍](../web/intro.md)
