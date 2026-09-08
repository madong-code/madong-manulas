# 1.2 技术栈

## 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| PHP | 8.2+ | 编程语言 |
| webman | 2.x | PHP 框架（基于 Workerman） |
| Composer | 2.x | 依赖管理 |
| MySQL | 5.7+ / 8.0+ | 数据库 |
| Redis | 5.0+ | 缓存 / 队列 |
| Workerman | 5.1 | WebSocket / 进程管理 |
| 方法级权限 | 原生 `#[Permission]` 属性 | 权限控制 |
| Swagger | 5.x | API 文档 / 路由注册 |

## 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 18.x+ | 运行环境 |
| Vue | 3.5+ | 前端框架 |
| Vite | 6.x | 构建工具 |
| Element Plus | 2.9+ | UI 组件库 |
| vxe-table | 4.12+ | 表格组件 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由管理 |
| TypeScript | 5.x | 类型系统 |

## 系统要求

| 环境 | 要求 |
|------|------|
| 操作系统 | Linux / macOS / Windows WSL2 |
| PHP | 8.2 及以上 |
| MySQL | 5.7 及以上 |
| Redis | 5.0 及以上 |
| Node.js | 18.0 及以上 |

## 下一步

- [1.3 整体架构](architecture.md)
- [1.4 目录结构](directory.md)
- [1.5 核心特征](features.md)