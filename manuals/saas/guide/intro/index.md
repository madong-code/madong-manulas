# 介绍

**Madong-Saas** 极速后台开发框架，是一套基于 **Webman (PHP 8.2+) + Vue 3 / Nuxt 4** 的前后端分离多租户中后台开发框架，用于快速搭建企业级管理系统、「门户站 + 管理后台」一体化交付的项目。

## 一、它是什么

Madong-Saas 极速开发后台框架，将高性能 PHP 后端与现代化 Vue 前端解耦，并通过插件化机制让功能模块可插拔。各端均为**独立仓库**、可独立运行：

| 位置 | 说明 | 技术栈 |
| --- | --- | --- |
| `backend/` | 后端服务，常驻内存的 HTTP / WebSocket 服务 | PHP 8.2+、Webman 2.2、illuminate/database |
| `template/mono/` | 管理端 Monorepo（admin 后台 / platform 平台 / install 安装向导） | Vue 3 + Vite + TypeScript + Element Plus |
| `template/web/` | 门户网站端 | Nuxt 4 + Element Plus + UnoCSS |
| `skills/` | 面向 AI 编码助手的开发规约集 | Markdown |

> **说明**：Madong-Saas 采用**多仓库**组织，后端、mono（管理端）、前端（门户）、skills 各为独立仓库，可独立 clone、独立部署。

## 二、仓库地址

Madong-Saas 各端均为独立仓库，分别对应以下目录。各平台地址已按实际组织 / 仓库名配置：

### 后端服务 backend/

| 栏目 | 地址 |
| --- | --- |
| GitHub | https://github.com/madong-code/madong |
| Gitee | https://gitee.com/motion-code/madong |
| GitCode | https://gitcode.com/motion-code/madong |

### 管理端 mono（template/mono/）

| 栏目 | 地址 |
| --- | --- |
| GitHub | https://github.com/madong-code/mono |
| Gitee | https://gitee.com/motion-code/mono |
| GitCode | https://gitcode.com/motion-code/mono |

### 门户网站端 template/web/

| 栏目 | 地址 |
| --- | --- |
| GitHub | https://github.com/madong-code/web-nuxt |
| Gitee | https://gitee.com/motion-code/web-nuxt |
| GitCode | https://gitcode.com/motion-code/web-nuxt |

### AI 编码规约 skills/

| 栏目 | 地址 |
| --- | --- |
| GitHub | https://github.com/madong-code/madong-saas-skills |
| Gitee | https://gitee.com/motion-code/madong-saas-skills |
| GitCode | https://gitcode.com/motion-code/madong-saas-skills |

## 三、核心特性

1. **常驻内存、高性能** —— 基于 Workerman/Webman 多进程常驻模型，避免传统 PHP-FPM 每次请求重新加载框架的开销。
2. **严格分层** —— `Controller → Service → Dao → Model` 四层职责单一，杜绝业务逻辑散落。
3. **注解驱动路由** —— 路由由 OpenAPI 注解自动派生，接口文档与实现天然同步。
4. **可插拔** —— 前后端均支持插件目录，删除目录即卸载功能，核心不受影响。
5. **多租户** —— 内置字段 / 表 / 库三种租户隔离模式，开箱即用的 SaaS 多租户能力。
6. **AI 友好** —— `skills/` 目录以结构化规约描述项目约定，可直接被编码助手消费。

## 四、适用场景

- 企业内部管理系统
- SaaS 多租户平台
- 需要长连接（WebSocket 推送、Web 终端）的运维 / 监控平台
- 需要门户站 + 管理后台一体化交付的项目

## 五、版本说明

| 项 | 内容 |
| --- | --- |
| 文档版本 | v5.1 |
| 框架代号 | Madong-SaaS |
| 后端基线 | Webman 2.2 / PHP 8.2+ |
| 前端基线 | Vue 3 + Vite + TypeScript（admin 端 Vben Admin 5.7 内核） |

> **注意**：当前文档为 Madong-Saas v5.0 版本，如果你使用的是 v4.0 版本，请查看 Madong-Saas v4 文档。
