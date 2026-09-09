# Web 应用（Nuxt 4）

## 概述

`template/web` 是 Madong SaaS 的**用户端 Web 应用**，基于 **Nuxt 4** 构建，面向终端用户（C 端），与 `mono`（管理后台）并列。

| 特性 | 说明 |
|------|------|
| 前端框架 | Nuxt 4（Vue 3 + Vite） |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia（持久化插件） |
| 国际化 | Vue I18n（中文 / 英文） |
| 样式方案 | SCSS + UnoCSS |
| 图标 | Nuxt Icons + Iconify |
| 构建工具 | Vite（Nitro 引擎） |
| 包管理器 | pnpm |

## 核心功能

- **认证系统**：登录 / 注册 / 忘记密码 / Token 自动刷新
- **会员中心**：个人资料、密码修改、余额、积分、签到
- **国际化**：多语言切换（中文 / 英文）
- **主题系统**：深色 / 浅色模式切换
- **路由系统**：基于文件系统的自动路由 + 插件路由动态加载
- **SEO**：页面元数据配置

## 与其他前端应用的关系

```
Madong-Saas/
├── template/
│   ├── mono/          # 管理后台（Nuxt? No - Vben Admin + Vite）
│   │   ├── apps/admin/     # 超级管理员后台
│   │   ├── apps/platform/  # 普通管理员后台
│   │   └── apps/install/  # 安装向导
│   └── web/           # 用户端 Web 应用（Nuxt 4）← 本文档
└── backend/            # 后端（共用）
```

| 应用 | 技术栈 | 面向用户 | 访问路径 |
|------|--------|----------|----------|
| mono/apps/admin | Vben Admin + Vite | 超级管理员 | `/admin` |
| mono/apps/platform | Vben Admin + Vite | 租户管理员 | `/platform` |
| mono/apps/install | Vben Admin + Vite | 安装者 | `/install` |
| **web** | **Nuxt 4 + Element Plus** | **终端用户** | `/web` |

## 相关文档

- [快速开始](quickstart.md) - 环境搭建与启动
- [项目结构](structure.md) - 目录结构说明
- [配置体系](config.md) - Nuxt 配置与环境变量
- [国际化](i18n.md) - 多语言配置
- [路由系统](router.md) - 页面路由与布局
- [状态管理](stores.md) - Pinia Store 说明
- [API 层](api.md) - 接口请求封装
- [认证系统](auth.md) - 登录注册与 Token 管理
- [主题系统](theme.md) - 深色模式切换
- [布局系统](layouts.md) - 页面布局组件
- [部署](deploy.md) - 构建与部署

---

> 💡 如果你是第一次接触本项目，建议从[快速开始](quickstart.md)开始。
