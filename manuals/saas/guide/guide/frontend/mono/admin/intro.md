# Admin 应用介绍

## 概述

Admin（后台管理前端）是 Madong SaaS 系统的后台管理界面，用于管理会员、商品、订单、营销、财务、内容、插件、工具等业务功能。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件**: Element Plus
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router (后端菜单驱动)
- **国际化**: Vue I18n
- **HTTP 客户端**: @vben/request
- **表格组件**: Vxe Table
- **表单组件**: Vben Form

## 应用特点

### 1. 后端菜单驱动

Admin 使用后端菜单模式（`accessMode: 'backend'`），路由和菜单由后端动态返回，前端只需定义路由映射。

### 2. 多租户支持

Admin 支持多租户切换，用户可以在不同租户之间切换，每个租户有独立的数据和配置。

### 3. 10 个业务模块

Admin 包含 10 个业务模块，覆盖完整的 SaaS 业务场景：

- **system/** - 系统管理
- **member/** - 会员管理
- **goods/** - 商品管理
- **order/** - 订单管理
- **marketing/** - 营销管理
- **finance/** - 财务管理
- **content/** - 内容管理
- **plugin/** - 插件管理
- **tools/** - 工具管理
- **dashboard/** - 仪表盘

### 4. Vben 框架

Admin 基于 Vben Admin 5 框架构建，使用其组件系统、表单系统、表格系统等。

### 5. WebSocket 消息通知

Admin 使用 WebSocket Push 实现实时消息通知，用户可以在界面上实时接收系统通知。

## 与其他应用的关系

Admin 与 Platform、Install 一样，**都位于 `template/mono` 的 monorepo 中**（`apps/admin`），共享 `packages/*` 核心代码：

```
┌─────────────────────────────────────────────────────────┐
│                    Madong SaaS                          │
├─────────────────────────────────────────────────────────┤
│                 template/mono (pnpm workspace)         │
│  ├── Admin      - 后台应用（多租户）← 当前应用         │
│  ├── Platform   - 平台应用（无多租户）                  │
│  └── Install    - 安装向导（独立轻量）                  │
├─────────────────────────────────────────────────────────┤
│  template/web   - 用户端 Web（Nuxt，独立仓库）          │
└─────────────────────────────────────────────────────────┘
```

## 包信息

- **包名**: `@madong/admin`
- **版本**: `5.7.0`
- **入口**: `template/mono/apps/admin/src/main.ts`
- **代理前缀**: `/adminapi`
- **开发端口**: `5777`（`.env.development` 中的 `VITE_PORT`）

## 目录结构

```
template/mono/apps/admin/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── bootstrap.ts               # 启动引导
│   ├── preferences.ts             # 偏好配置
│   ├── api/                       # API 层
│   ├── components/                # 组件
│   ├── router/                    # 路由
│   ├── store/                     # 状态管理
│   ├── views/                     # 页面
│   ├── lang/                      # 业务国际化
│   └── locales/                   # 框架国际化
├── package.json
├── .env.development               # 开发环境变量
└── vite.config.ts
```

## 特有组件

Admin 除了共享的基础组件（crud/dialog/form/render/icon/page），还有以下特有组件：

### tenant-switch/ - 租户切换

用于多租户场景下切换当前租户。调用 `authStore.switchTenant(tenantId)` 切换租户，切换后重新加载用户信息、权限码、路由。

### terminal/ - Web 终端

在线终端组件，支持命令执行和 SSE 实时输出。命令模块：composer/npm/pnpm/build 等。SSE 连接通过 `api/request.ts` 的 `sse()` 函数。

### utils/sse/ - SSE 工具

Admin 独有的 SSE 工具函数，其他应用不使用此目录。

## 下一步

- [快速开始](./quickstart.md) - 安装依赖、启动开发
- [项目结构](./structure.md) - 详细了解项目结构
- [系统配置](./config.md) - 配置环境变量
