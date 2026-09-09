# Platform 应用介绍

## 概述

Platform（平台管理前端）是 Madong SaaS 系统的平台管理界面，用于管理租户、系统配置、插件、数据库、监控等平台级功能。

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

Platform 使用后端菜单模式（`accessMode: 'backend'`），路由和菜单由后端动态返回，前端只需定义路由映射。

### 2. 无多租户

与 Admin 不同，Platform 不包含多租户切换逻辑，因为 Platform 是平台管理端，管理所有租户。

### 3. 6 个业务模块

Platform 包含 6 个业务模块，聚焦平台运维：

- **system/** - 系统管理
- **tenant/** - 租户管理
- **plugin/** - 插件管理
- **database/** - 数据库管理
- **monitor/** - 监控管理
- **dashboard/** - 仪表盘

### 4. Vben 框架

Platform 基于 Vben Admin 5 框架构建，使用其组件系统、表单系统、表格系统等。

## 与其他应用的关系

Platform 与 Admin、Install 一样，**都位于 `template/mono` 的 monorepo 中**，共享 `packages/*` 核心代码：

```
┌─────────────────────────────────────────────────────────┐
│                    Madong SaaS                          │
├─────────────────────────────────────────────────────────┤
│                 template/mono (pnpm workspace)         │
│  ├── Admin      - 后台应用（多租户）                    │
│  ├── Platform   - 平台应用（无多租户）← 当前应用       │
│  └── Install    - 安装向导（独立轻量）                  │
├─────────────────────────────────────────────────────────┤
│  template/web   - 用户端 Web（Nuxt，独立仓库）          │
└─────────────────────────────────────────────────────────┘
```

## 包信息

- **包名**: `@madong/platform`
- **版本**: `5.7.0`
- **仓库位置**: `template/mono/apps/platform`
- **入口**: `template/mono/apps/platform/src/main.ts`
- **代理前缀**: `/platformapi`

## 目录结构

```
template/mono/apps/platform/
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
├── .env                          # 环境变量
└── vite.config.ts
```

## 下一步

- [快速开始](./quickstart.md) - 安装依赖、启动开发
- [项目结构](./structure.md) - 详细了解项目结构
- [系统配置](./config.md) - 配置环境变量
