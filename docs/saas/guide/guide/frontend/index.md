# 3. 前端开发

Madong 前端采用 **mono（管理端）+ web（用户端）** 的架构：

| 应用 | 路径 | 面向 | 技术栈 | 对接后端 |
| --- | --- | --- | --- | --- |
| **mono 基座** | `template/mono` | 多应用 monorepo 共享核心 | Vben Admin 5.7（pnpm + turbo） | — |
| **平台应用** | `template/mono/apps/platform` | 平台/租户管理员 | Vue 3 + Vite + Element Plus | `/platformapi` |
| **后台应用** | `template/mono/apps/admin` | 超级管理员（多租户） | Vue 3 + Vite + Element Plus | `/adminapi` |
| **install** | `template/mono/apps/install` | 安装向导（独立轻量） | Vue 3 + Element Plus + Pinia | `/adminapi/install` |
| **web** | `template/web` | 终端用户（C 端） | Nuxt 4 + Element Plus + UnoCSS | `/api` |

## 3.1 结构说明

Madong 的 `mono` 是一个 pnpm workspace，同时承载**平台应用**与**后台应用**（外加安装向导 install），共享 `packages/*` 核心代码；`web` 是独立的 Nuxt 用户端，与 mono 并列。

```
template/
├── mono/                        # 管理端 monorepo
│   ├── apps/
│   │   ├── admin/               # 后台应用（多租户）
│   │   ├── platform/            # 平台应用
│   │   └── install/             # 安装向导
│   └── packages/                # 共享包（@core / effects / utils ...）
└── web/                         # 用户端 Web（Nuxt 4）
```

## 3.2 应用差异

| 维度 | mono（平台/后台） | web |
| --- | --- | --- |
| 渲染方式 | SPA（Vite） | Nuxt（当前 `ssr: false`，可切换） |
| 路由 | 后端下发的动态菜单 | 文件路由 + 插件路由 |
| 权限 | RBAC（权限码/按钮级） | 以登录态为主 |
| 多租户 | 后台应用支持 | 无 |
| 核心场景 | 表格、表单、CRUD | 内容展示、SEO |

## 3.3 核心思想

后台应用最重要的特点是**声明式 CRUD**：一个业务页面通常只需一个 `index.vue` 加一份 `schemas/index.tsx`，详见 [后台应用 → CRUD](mono/components/crud/overview.md)。

## 3.4 阅读路线

- **mono 基座**：先读 [Mono 基座介绍](mono/intro.md)，了解 monorepo 结构
- **平台应用**：走 [平台应用介绍](mono/platform/intro.md) → 快速开始
- **后台应用**：走 [后台应用介绍](mono/admin/intro.md) → 快速开始 → CRUD 开发
- **Web 用户端**：走 [Web 用户端介绍](web/intro.md) → 快速开始

> 下一节：[3-1. Mono 基座](mono/intro.md)
